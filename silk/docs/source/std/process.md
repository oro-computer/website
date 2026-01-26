# `std::process`

Status: **Work in progress** (hosted POSIX baseline).

`std::process` provides access to process-level operations that are not tied to
environment variables, such as the current working directory.

The current implementation targets a hosted POSIX baseline (Linux/glibc) and is
implemented on top of the pluggable `std::runtime::process` interface. WASI
support is currently a stub (see “Platform notes”).

## API

```silk
module std::process;

	import std::result;
	import std::strings;

	enum ChdirErrorKind { InvalidInput, NotFound, NotADirectory, PermissionDenied, Unknown }
	error ChdirFailed { code: int }

	enum GetCwdErrorKind { OutOfMemory, NotFound, PermissionDenied, Unknown }
	error GetCwdFailed { code: int, requested: i64 }

export type GetCwdError = GetCwdFailed;
export type GetCwdResult = std::result::Result(std::strings::String, GetCwdError);

export fn chdir (path: string) -> ChdirFailed?;
export fn getcwd () -> GetCwdResult;
```

## Child processes (`std::process::child`)

`std::process::child` provides hosted child-process execution (spawn/wait/kill)
and high-level output capture.

For convenience, `std::process` re-exports the high-level `std::process::child`
surface so downstream users can write:

```silk
import std::process;

let mut cmd = std::process::Command.init("/bin/echo");
cmd.arg("hello");
let out_r = cmd.output();
```

See the `std::process::child` source (`std/process/child.slk`) for the exact,
current API surface.

## `getcwd`

`std::process::getcwd()` returns the current working directory as an owned
`std::strings::String`.

Ownership:

- Callers must drop the returned `String` when finished.

Errors are reported as a recoverable result:

- `getcwd` has signature `-> GetCwdResult`,
- on success: `value = Some(String)`, `err = None`,
- on failure: `value = None`, `err = Some(GetCwdFailed{ code, requested })` (use `GetCwdFailed.kind()` to distinguish failure kinds).

`GetCwdFailed` does not expose platform `errno` values. Use `GetCwdFailed.kind()`
to classify failures into `GetCwdErrorKind` values.

## `chdir`

`std::process::chdir(path)` changes the process working directory.

Errors are reported as an optional error value:

- `chdir` has signature `-> ChdirFailed?`,
- it returns `None` on success,
- it returns `Some(ChdirFailed{ code })` when the underlying runtime operation fails.

`ChdirFailed` does not expose platform `errno` values. Use `ChdirFailed.kind()`
to classify failures into `ChdirErrorKind` values.

Notes:

- `chdir` does not update environment variables like `PWD`. Use
  `std::process::getcwd()` to query the real current directory.

## Platform notes

- **POSIX (default shipped stdlib)**: implemented via `getcwd(3)` and
  `chdir(2)`.
- **Child processes (POSIX)**: implemented via `fork(2)` + `exec*` + `waitpid(2)`
  with pipe-based stdio and poll-based output capture.
- **WASI**: currently stubbed:
  - `getcwd` fails (returns `GetCwdResult.err = Some(GetCwdFailed{ code })`),
  - `chdir` fails (returns `Some(ChdirFailed{ code })`).
  - `std::process::child` operations fail.
