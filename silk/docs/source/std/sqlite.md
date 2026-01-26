# `std::sqlite`

Status: **Implemented subset + design**. `std::sqlite` provides SQLite database
primitives for the hosted POSIX baseline using the system `libsqlite3` shared
library.

The initial goals are:

- a small but usable database/statement API (`Database`, `Stmt`),
- a non-leaking, portable error model (`SqliteFailed`) that surfaces stable
  error kinds while retaining SQLite return codes as structured detail,
- safe defaults (`invalid()` handles, idempotent `drop()`), so resource cleanup
  is reliable even in early-return code.

## Linkage and Toolchain Integration

On `linux/x86_64` with the glibc dynamic loader (`ld-linux`), `silk build`
automatically adds `libsqlite3.so.0` as a `DT_NEEDED` dependency when a program
imports `sqlite3_*` extern symbols (for example via `import std::sqlite;`).

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
