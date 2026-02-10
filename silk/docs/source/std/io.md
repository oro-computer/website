# `std::io`

Status: **Design + initial implementation**. Basic stdin reads and stdout/stderr writes
are implemented in `std/io.slk` via `std::runtime::io`; buffered and
async I/O remain future work.

`std::io` provides console and basic stream I/O.

Hosted baseline: POSIX file descriptors and blocking I/O. Future extensions may
include async integration.

See also:

- `docs/std/strings.md` (formatting targets and string building)
- `docs/std/fmt.md` (format string syntax)
- `docs/std/conventions.md` (error conventions)

## Current API (Implemented)

The current stdlib provides basic unbuffered stdio primitives
(stdin reads and stdout/stderr writes), plus a small formatting surface
(implemented without libc varargs; formatted bytes are written via
`std::runtime::io::write`):

```silk
module std::io;

enum IOErrorKind {
  OutOfMemory,
  BadFileDescriptor,
  NotFound,
  PermissionDenied,
  WouldBlock,
  Interrupted,
  BrokenPipe,
  InvalidInput,
  Unknown,
}

struct IOFailed { code: int, requested: i64 }
export type IOResult = std::result::Result(int, IOFailed);
export type IOError = IOFailed;
export type IOErrorIntResult = std::result::Result(int, IOError);

export fn read (fd: int, buf: std::arrays::ByteSlice) -> IOResult;
export fn write (fd: int, buf: std::arrays::ByteSlice) -> IOResult;
export fn write_all (fd: int, buf: std::arrays::ByteSlice) -> IOFailed?;
export fn read_to_end (fd: int, mut out: &std::buffer::BufferU8) -> IOErrorIntResult;

export fn read_stdin (buf: std::arrays::ByteSlice) -> IOResult;
export fn write_stdout (buf: std::arrays::ByteSlice) -> IOResult;
export fn write_stderr (buf: std::arrays::ByteSlice) -> IOResult;

export fn puts (s: string) -> IOFailed?;

export fn print (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;

export fn println (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;

export fn eprint (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;

export fn eprintln (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;
```

Notes:

- `print`/`println` accept Zig-`std.fmt`-style format strings (see
  `docs/std/fmt.md`) and a variable number of `std::fmt::Arg` arguments (within
  the current compiler’s varargs limit).
- `eprint`/`eprintln` are the stderr equivalents of `print`/`println`.
- `IOFailed.code` is a stable stdlib error code; callers should prefer `IOFailed.kind()`.
- Invalid buffer arguments report `IOErrorKind::InvalidInput`.
- `read_to_end` returns `IOErrorIntResult` (`Ok(total_bytes)` or `Err(IOFailed)`), where allocation failure is reported as `IOErrorKind::OutOfMemory` and `IOFailed.requested`.
- For ergonomics, `std::fmt::Arg` opts into the compiler’s implicit
  call-argument coercion mechanism (see `docs/language/types.md`). This allows
  passing primitive values (`int`/fixed-width ints, `usize`/`size`, `f32`/`f64`,
  `bool`, `char`, `string`, `regexp`, `Region`) directly when calling functions
  that expect `Arg` parameters (including varargs), so you can write
  `println("hello {}", "world")` without explicit `Arg.*` wrappers.
- Executable outputs import external libc symbols. On `linux/x86_64` with the
  glibc dynamic loader (`ld-linux`), `silk` automatically adds `libc.so.6` as a
  `DT_NEEDED` dependency when external symbols are present, so `--needed libc.so.6`
  is not required for typical hosted `std::io` use.
- `string` parameters in `ext` calls are lowered as C-string pointers in the
  current backend subset (the backing bytes include a trailing NUL terminator;
  Silk `string` length excludes it).

Example (formatted printing):

```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

Example (stdin → stdout echo using unbuffered reads/writes):

```silk
import std::io;
import std::arrays;
import std::runtime::io;
import std::runtime::mem;

fn main () -> int {
  let buf: u64 = std::runtime::mem::alloc(64);
  if buf == 0 {
    return 2;
  }

  while true {
    let r: std::io::IOResult = std::io::read_stdin(std::arrays::ByteSlice{ ptr: buf, len: 64 });
    if r.is_err() {
      std::runtime::mem::free(buf);
      return 3;
    }

    let n: int = match (r) {
      std::io::IOResult::Ok(v) => v,
      std::io::IOResult::Err(_) => 0,
    };
    if n == 0 {
      break;
    }

    let w_err: std::io::IOFailed? = std::io::write_all(std::runtime::io::STDOUT_FD, std::arrays::ByteSlice{ ptr: buf, len: n as i64 });
    if w_err != None {
      std::runtime::mem::free(buf);
      return 4;
    }
  }

  std::runtime::mem::free(buf);
  return 0;
}
```
## Scope

`std::io` is responsible for:

- Standard input, output, and error streams.
- Simple printing and formatted output APIs.

## Core Interfaces (Initial Design)

The stdlib should standardize reader/writer interfaces:

```silk
module std::io;

export enum IOErrorKind {
  // Stable error kinds (portable subset).
  PermissionDenied,
  NotFound,
  BrokenPipe,
  WouldBlock,
  UnexpectedEof,
  Unknown,
}

export interface Writer {
  write: fn(self: &Writer, bytes: std::arrays::Slice(u8)) -> Result(int, IOErrorKind);
  flush: fn(self: &Writer) -> IOErrorKind?;
}

export interface Reader {
  read: fn(self: &Reader, dst: std::arrays::Slice(u8)) -> Result(int, IOErrorKind);
}
```

The concrete representation of interfaces will evolve with the language; the
key point is that `std::fs` and `std::net` can reuse the same I/O traits.

## Convenience API

- stdout/stderr: `print`/`println` and `eprint`/`eprintln` (formatted output).
- unbuffered primitives: `read_stdin`, `write_stdout`, `write_stderr`.
- future (design): `stdout()` / `stderr()` / `stdin()` handle-returning helpers
  built on a stable reader/writer interface.

## Future Work

- Buffered I/O wrappers (`BufReader`, `BufWriter`).
- Async-aware adapters:
  - the hosted `linux/x86_64` toolchain now ships a bring-up async executor and
    exposes timers + fd readiness via `std::runtime::event_loop`,
  - `std::task` includes awaitable sleep helpers (`sleep_ms_async`, `sleep_async`),
  - `std::io::async` provides minimal `async fn` wrappers over fd-based
    `read`/`write` using the event loop readiness waits.
  Broader async I/O surface (buffered async I/O, sockets, filesystem streams,
  cancellation, and `select`-style waiting) remains future work.
