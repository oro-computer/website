# `std::process`

(hosted POSIX baseline).

`std::process` provides access to process-level operations that are not tied to
environment variables, such as the current working directory.

This module targets a hosted POSIX baseline (Linux/glibc) and is
implemented on top of the pluggable `std::runtime::process` interface. WASI
support is Implemented (see “Platform notes”).

## Exported API

```silk
module std::process;
  import strings from "std/strings";

  enum ChdirErrorKind { InvalidInput, NotFound, NotADirectory, PermissionDenied, Unknown }
  error ChdirFailed { code: int }

  enum GetCwdErrorKind { OutOfMemory, NotFound, PermissionDenied, Unknown }
  error GetCwdFailed { code: int, requested: i64 }

export type GetCwdError = GetCwdFailed;
export type GetCwdResult = std::result::Result(std::strings::String, GetCwdError);
export type ExecutablePathError = GetCwdFailed;
export type ExecutablePathResult = std::result::Result(std::strings::String, ExecutablePathError);

export fn chdir (path: string) -> ChdirFailed?;
export fn getcwd () -> GetCwdResult;
export fn getpid () -> int;
export fn executable_path () -> ExecutablePathResult;
```

## Child processes (`std::process::child`)

`std::process::child` provides hosted child-process execution (spawn/wait/kill)
and high-level output capture.

For convenience, `std::process` re-exports the high-level `std::process::child`
surface so downstream users can write:

```silk
import process from "std/process";

let mut cmd = std::process::Command.init("/bin/echo");
cmd.arg("hello");
let out_r = cmd.output();
```

See the `std::process::child` source (`std/process/child.slk`) for the exact,
exported API surface.

The current high-level child-process surface includes:

```silk
module std::process::child;

export enum Stdio { Inherit, Null, Pipe }

export error Failed { code: int, stage: int, detail: int }

export struct ExitStatus { /* opaque */ }
export type WaitResult = std::result::Result(ExitStatus, Failed);

export struct Child { /* opaque */ }
export type ChildResult = std::result::Result(Child, Failed);

export struct PtyChild { /* opaque */ }
export type PtyChildResult = std::result::Result(PtyChild, Failed);

export struct Command { /* opaque */ }
impl Command {
  public fn init (program: string) -> Command;
  public fn arg (mut self: &Command, value: string) -> std::memory::OutOfMemory?;
  public fn env (mut self: &Command, kv: string) -> std::memory::OutOfMemory?;
  public fn current_dir (mut self: &Command, dir: string) -> void;
  public fn stdin (mut self: &Command, cfg: Stdio) -> void;
  public fn stdout (mut self: &Command, cfg: Stdio) -> void;
  public fn stderr (mut self: &Command, cfg: Stdio) -> void;
  public fn spawn (self: &Command) -> ChildResult;
  public fn spawn_pty (self: &Command) -> PtyChildResult;
  public fn output (self: &Command) -> OutputResult;
}
```

### PTY-backed child processes

`Command.spawn_pty()` is the friendly stdlib surface for the old Sven-facing
"spawn child under a controlling PTY" gap. It:

- opens a fresh PTY pair,
- attaches the child stdin/stdout/stderr to the slave side,
- prepares the child side as the controlling terminal on hosted POSIX targets,
- returns the parent-facing master fd through `PtyChild.take_master()`.

`PtyChild` owns both the child handle and the master fd. Dropping it closes the
master fd and drops the underlying child handle. If you want to drive the PTY
yourself, call `take_master()` and then manage that fd explicitly.

### Child stdio pipes and `std::stream`

When a child is spawned with piped stdio (`Stdio::Pipe`), `std::process::child`
exposes the pipes as POSIX file descriptors (`Child.take_stdin()` /
`take_stdout()` / `take_stderr()`).

To treat those file descriptors as `std::stream` byte streams, use the
task-based adapters in `std::io::stream`:

- `std::io::stream::pipe_fd_to_stream` / `pipe_fd_to_stream_abortable` (fd → `WritableStream`)
- `std::io::stream::pipe_stream_to_fd` / `pipe_stream_to_fd_abortable` (`ReadableStream` → fd)

This keeps the child-process API small and portable while still enabling
stream-oriented composition.

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

## `executable_path`

`std::process::executable_path()` returns an owned path to the current
executable.

Ownership:

- Callers must drop the returned `String` when finished.

Errors use the same stable error family as `getcwd`:

- on success: `Ok(String)`,
- on failure: `Err(GetCwdFailed{ code, requested })`.

On POSIX hosted targets this queries the operating system rather than reading
`argv[0]`. Use `std::env::executable_path_from_args(argc, argv)` when the
borrowed launcher-provided argv string is the desired zero-copy representation.

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

- **POSIX (default shipped stdlib)**: implemented via `getcwd(3)`,
 `chdir(2)`, `getpid(2)`, and platform executable-path queries
 (`/proc/self/exe` on Linux, `_NSGetExecutablePath` on macOS).
- **Child processes (POSIX)**: implemented via `fork(2)` + `exec*` + `waitpid(2)`
 with pipe-based stdio, PTY-backed child spawn, and poll-based output capture.
- **WASI (Preview 1)**: `getcwd` and `chdir` are implemented via a virtual
 working directory. `getpid()` currently returns 0, and the OS-queried
 executable path is unavailable; use `std::args::current().get(0)` or
 `std::env::executable_path_from_args` when argv is available.
 `std::process::child` operations remain unsupported.
