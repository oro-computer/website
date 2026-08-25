# `std::sqlite`

`std::sqlite` provides SQLite database
primitives for the hosted POSIX baseline. On supported hosted target layouts,
`silk build` auto-links the built-in `libsqlite3.a` so outputs do not depend on
a system SQLite shared library at runtime.

The initial goals are:

- a small but usable database/statement API (`Database`, `Stmt`),
- a non-leaking, portable error model (`SqliteFailed`) that surfaces stable
 error kinds while retaining SQLite return codes as structured detail,
- safe defaults (`invalid()` handles, idempotent `drop()`), so resource cleanup
 is reliable even in early-return code.

## Linkage and Toolchain Integration

When a program imports `std::sqlite`, `silk build` automatically links the
target-matched built-in `libsqlite3.a` archive from:

- repo builds: `vendor/lib/<target-layout>/libsqlite3.a`
- staged toolchains: `build/lib/silk/vendor/lib/<target-layout>/libsqlite3.a`
- installed toolchains: `<prefix>/lib/silk/vendor/lib/<target-layout>/libsqlite3.a`

The current target layouts are `x64-linux` for glibc Linux x86_64,
`x64-linux-musl` for musl Linux x86_64, and `aarch64-macos` for Apple Silicon
macOS.

This keeps `std::sqlite` runnable without requiring `libsqlite3.so.*` at
runtime.

To link dynamically (system SQLite), pass `--needed libsqlite3.so.0` (or set
`[[target]].needed = ["libsqlite3.so.0"]` in `silk.toml`) and ensure the SONAME
is resolvable by the dynamic loader on the target system.

To build the built-in static library artifact used for embedding and future
bundling, run `zig build deps`. This downloads and extracts the pinned SQLite
amalgamation source:

- upstream: `https://www.sqlite.org/2026/sqlite-amalgamation-3510200.zip`
- output staging (hosted baseline):
 - `vendor/deps/sqlite-amalgamation-3510200/` (source; ignored),
 - `vendor/lib/<target-layout>/libsqlite3.a` (static library; ignored),
 - `vendor/include/<target-layout>/sqlite3.h` +
 `vendor/include/<target-layout>/sqlite3ext.h` (headers; ignored).

## Error Model

`std::sqlite` uses `std::result::Result(T, E)` and optional-error returns for
fallible operations that do not return a value.

The stable error value is `SqliteFailed`:

```silk
module std::sqlite;

export error SqliteFailed {
  code: int, // stable ERR_* code
  rc: int,   // primary SQLite rc
  detail: int,  // extended rc when available
}
```

Callers that want a portable classification should use `SqliteFailed.kind()`.
The raw SQLite return codes remain available for debugging/telemetry.

## Handles and Lifetimes

- `Database` and `Stmt` are handle types with safe defaults:
 - `Database.invalid()` / `Stmt.invalid()` construct invalid handles.
 - `drop()` is idempotent and safe to call on invalid handles.
- Borrowed column accessors:
 - `Stmt.column_text(col) -> string?` and `Stmt.column_blob(col) -> ByteSlice?`
 return views into SQLite-owned memory.
 - These views are valid until the next `step`/`reset`/`finalize` on the same
 statement.
- Copy helpers:
 - `Stmt.column_text_copy` copies into `std::strings::String`.
 - `Stmt.column_blob_copy` copies into `std::buffer::BufferU8`.

## Exported API

The current `std::sqlite` surface currently lives in `std/sqlite.slk` and
provides:

- `Database`: `open`, `open_read_only`, `open_in_memory`, `exec`, `prepare`,
 `busy_timeout_ms`, `changes`, `last_insert_rowid`,
- `Stmt`: `bind_int`, `bind_i64`, `bind_text`, `bind_null`, `bind_blob`,
 `step`, `reset`, `clear_bindings`, `column_*` accessors, and
 `finalize`/`drop`.
- Async-friendly helpers:
 - `open_async`, `open_read_only_async`, `open_in_memory_async`
 - `exec_path_async`, `exec_in_memory_async`

The async-friendly helpers are wrappers over the current blocking SQLite path.
They run the work on a task worker so async code can `await` simple open/exec
operations without blocking its executor owner thread.

## Empty text and SQL NULL

`Stmt.bind_text(index, value)` always binds SQL TEXT. A zero-length Silk string
is bound as a zero-length TEXT value even when its valid Silk representation
has a null data pointer. The implementation supplies SQLite with a stable
non-null address and an explicit byte count of zero, so SQLite cannot reinterpret
the value as SQL NULL. Nonempty strings continue to use `SQLITE_TRANSIENT`, and
SQLite copies their bytes before `bind_text` returns.

Call `Stmt.bind_null(index)` when the intended database value is SQL NULL. This
separation keeps an empty required text field distinct from absent or unknown
data and leaves SQLite's ordinary parameter-index diagnostics unchanged.
