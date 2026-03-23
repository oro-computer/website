# `std::sqlite`

`std::sqlite` provides SQLite database
primitives for the hosted POSIX baseline. On `linux/x86_64`, `silk build`
auto-links the vendored `libsqlite3.a` so outputs do not depend on a system
SQLite shared library at runtime.

The initial goals are:

- a small but usable database/statement API (`Database`, `Stmt`),
- a non-leaking, portable error model (`SqliteFailed`) that surfaces stable
  error kinds while retaining SQLite return codes as structured detail,
- safe defaults (`invalid()` handles, idempotent `drop()`), so resource cleanup
  is reliable even in early-return code.

## Linkage and Toolchain Integration

On `linux/x86_64`, when a program imports `std::sqlite`, `silk build`
automatically links the vendored `libsqlite3.a` archive from:

- repo builds: `vendor/lib/x64-linux/libsqlite3.a`
- staged toolchains: `build/lib/silk/vendor/lib/x64-linux/libsqlite3.a`
- installed toolchains: `<prefix>/lib/silk/vendor/lib/x64-linux/libsqlite3.a`

This keeps `std::sqlite` runnable without requiring `libsqlite3.so.*` at
runtime.

To link dynamically (system SQLite), pass `--needed libsqlite3.so.0` (or set
`[[target]].needed = ["libsqlite3.so.0"]` in `silk.toml`) and ensure the SONAME
is resolvable by the dynamic loader on the target system.

To build the vendored static library artifact used for embedding and future
bundling, run `zig build deps`. This downloads and extracts the pinned SQLite
amalgamation source:

- upstream: `https://www.sqlite.org/2026/sqlite-amalgamation-3510200.zip`
- output staging (hosted baseline):
  - `vendor/deps/sqlite-amalgamation-3510200/` (source; ignored),
  - `vendor/lib/x64-linux/libsqlite3.a` (static library; ignored),
  - `vendor/include/sqlite3.h` + `vendor/include/sqlite3ext.h` (headers; ignored).

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

## Current API (Initial)

The current `std::sqlite` surface currently lives in `std/sqlite.slk` and
provides:

- `Database`: `open`, `open_read_only`, `open_in_memory`, `exec`, `prepare`,
  `busy_timeout_ms`, `changes`, `last_insert_rowid`,
- `Stmt`: `bind_int`, `bind_i64`, `bind_text`, `bind_blob`, `step`, `reset`,
  `clear_bindings`, `column_*` accessors, and `finalize`/`drop`.
