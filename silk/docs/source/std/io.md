# `std::io`

Basic stdin reads, stdout/stderr writes, an
fd-backed `BufferedWriter`, and a minimal `std::io::async` subset are
implemented in `std/io.slk` via `std::runtime::io`.

`std::io` provides console and basic stream I/O.

Hosted baseline: POSIX file descriptors and blocking I/O, with a minimal async
subset (`std::io::async`) backed by the hosted runtime on supported POSIX
hosts (`linux/*` and Apple Silicon `macos/aarch64` today). Linux may use
`io_uring` acceleration where available; other supported POSIX hosts use the
runtime poll fallback.

See also:

- [strings](?p=std/strings) (formatting targets and string building)
- [fmt](?p=std/fmt) (format string syntax)
- [conventions](?p=std/conventions) (error conventions)

## Exported API

The current stdlib provides basic unbuffered stdio primitives
(stdin reads and stdout/stderr writes), a small formatting surface
(implemented without libc varargs; formatted bytes are written via
`std::runtime::io::write`), and a minimal async wrapper layer in
`std::io::async`:

```silk
module std::io;

enum IOErrorKind {
  OutOfMemory,
  BadFileDescriptor,
  NotFound,
  PermissionDenied,
  WouldBlock,
  Interrupted,
  Aborted,
  BrokenPipe,
  InvalidInput,
  Unknown,
}

struct IOFailed { code: int, requested: i64 }
struct TTYSize { rows: int, cols: int }
struct TTYRawMode { handle: u64 }
struct BufferedWriter { fd: int, buf: std::buffer::BufferU8, flush_threshold: i64 }
export type IOResult = std::result::Result(int, IOFailed);
export type IOError = IOFailed;
export type IOErrorIntResult = std::result::Result(int, IOError);
export type TTYRawModeResult = std::result::Result(TTYRawMode, IOFailed);
export type BufferedWriterResult = std::result::Result(BufferedWriter, IOFailed);

export fn read (fd: int, buf: std::arrays::ByteSlice) -> IOResult;
export fn write (fd: int, buf: std::arrays::ByteSlice) -> IOResult;
export fn write_all (fd: int, buf: std::arrays::ByteSlice) -> IOFailed?;
export fn read_to_end (fd: int, mut out: &std::buffer::BufferU8) -> IOErrorIntResult;

export fn read_stdin (buf: std::arrays::ByteSlice) -> IOResult;
export fn write_stdout (buf: std::arrays::ByteSlice) -> IOResult;
export fn write_stderr (buf: std::arrays::ByteSlice) -> IOResult;

export fn isatty (fd: int) -> bool;
export fn tty_size (fd: int) -> TTYSize?;
export fn tty_open () -> IOResult;
export fn tty_raw_mode (fd: int) -> TTYRawModeResult;

export fn puts (s: string) -> IOFailed?;

export fn print (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;

export fn println (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;

export fn eprint (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;

export fn eprintln (fmt: string, ...args: std::fmt::Arg) -> PrintFailed?;

impl BufferedWriter {
  public fn init (fd: int, capacity: i64) -> BufferedWriterResult;
  public fn stdout (capacity: i64) -> BufferedWriterResult;
  public fn stderr (capacity: i64) -> BufferedWriterResult;
  public fn set_flush_threshold (mut self: &BufferedWriter, threshold: i64) -> void;
  public fn write (mut self: &BufferedWriter, bytes: std::arrays::ByteSlice) -> IOFailed?;
  public fn write_string (mut self: &BufferedWriter, s: string) -> IOFailed?;
  public fn write_u8 (mut self: &BufferedWriter, value: u8) -> IOFailed?;
  public fn flush (mut self: &BufferedWriter) -> IOFailed?;
  public fn drop (mut self: &BufferedWriter) -> void;
}
```

The shipped async subset lives in a sibling module:

```silk
module std::io::async;

export async fn read (fd: int, buf: std::arrays::ByteSlice) -> std::io::IOResult;
export async fn write (fd: int, buf: std::arrays::ByteSlice) -> std::io::IOResult;
export async fn read_abortable (fd: int, buf: std::arrays::ByteSlice, sig: std::abort_controller::AbortSignalBorrow?) -> std::io::IOResult;
export async fn write_abortable (fd: int, buf: std::arrays::ByteSlice, sig: std::abort_controller::AbortSignalBorrow?) -> std::io::IOResult;
```

Notes:

- `print`/`println` accept Zig-`std.fmt`-style format strings (see
 [fmt](?p=std/fmt)) and a variable number of `std::fmt::Arg` arguments (within
 the current compiler’s varargs limit).
- `eprint`/`eprintln` are the stderr equivalents of `print`/`println`.
- `IOFailed.code` is a stable stdlib error code; callers should prefer `IOFailed.kind()`.
- Invalid buffer arguments report `IOErrorKind::InvalidInput`.
- `read_to_end` returns `IOErrorIntResult` (`Ok(total_bytes)` or `Err(IOFailed)`), where allocation failure is reported as `IOErrorKind::OutOfMemory` and `IOFailed.requested`.
- `BufferedWriter` batches writes to an fd-backed byte buffer. `flush()`
 explicitly writes buffered bytes; `drop()` attempts to flush and then releases
 the backing allocation. Set `capacity == 0` for direct unbuffered writes.
- `isatty(fd)` returns `true` when `fd` refers to a TTY, otherwise `false`.
- `tty_size(fd)` returns `Some(TTYSize)` when the window size is available (TTY
 mode), otherwise `None`.
- `tty_open()` opens `/dev/tty` for interactive programs and returns `Ok(fd)` or
 `Err(IOFailed)`.
- `tty_raw_mode(fd)` enables termios raw mode and returns a `TTYRawMode` guard
 that restores the previous state on drop.
- For ergonomics, `std::fmt::Arg` opts into the compiler’s implicit
 call-argument coercion mechanism (see [types](?p=language/types)). This allows
 passing primitive values (`int`/fixed-width ints, `usize`/`size`, `f32`/`f64`,
 `bool`, `char`, `string`, `regexp`, `Region`) directly when calling functions
 that expect `Arg` parameters (including varargs), so you can write
 `println("hello {}", "world")` without explicit `Arg.*` wrappers. Values
 implementing `std::interfaces::Serialize(string)` also participate in this
 ergonomic path: when `Arg` is expected, the compiler may lower the value via
 `serialize()` and then feed the resulting string into `Arg.string(...)`.
- `std::strings::String` also satisfies ordinary borrowed `string`
 expectations in bindings and plain `string` parameters, so explicit
 `.as_string()` is no longer required solely to call helpers that take
 `string`.
- Executable outputs import external libc symbols. On `linux/x86_64` with the
 glibc dynamic loader (`ld-linux`), `silk` automatically adds `libc.so.6` as a
 `DT_NEEDED` dependency when external symbols are present, so `--needed libc.so.6`
 is not required for typical hosted `std::io` use.
- `string` parameters in `ext` calls are lowered as C-string pointers in the
 current backend subset (the backing bytes include a trailing NUL terminator;
 Silk `string` length excludes it).
- `std::io::async` provides small async wrappers (`read`/`write`) on top of
 `std::runtime::io::{read_async,write_async}`. On `linux/*` these are backed
 by the hosted async runtime (`io_uring` when available, `poll(2)` fallback).
 On other targets they complete immediately by issuing a blocking `read`/`write`.
 Abortable variants (`read_abortable` / `write_abortable`) accept an optional
 `std::abort_controller::AbortSignalBorrow` and return `IOErrorKind::Aborted`
 when cancelled.
 Note: in the Supported forms, aborts are observed before starting an I/O
 attempt; they do not interrupt an in-flight operation.
- `std::io::stream` provides task-based adapters that connect POSIX/WASI file
 descriptors (`fd`) with `std::stream` (`ReadableStream` / `WritableStream`):
 - `std::io::stream::pipe_fd_to_stream` / `pipe_fd_to_stream_abortable`
 - `std::io::stream::pipe_stream_to_fd` / `pipe_stream_to_fd_abortable`
 These adapters take ownership of the `fd` and close it before returning.

Example (formatted printing):

```silk
import io from "std/io";

fn main () -> int {
  std::io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

Example (stdin → stdout echo using unbuffered reads/writes):

```silk
import io from "std/io";
import arrays from "std/arrays";
import runtime_io from "std/runtime/io";
import mem from "std/runtime/mem";

fn main () -> int {
  let buf: u64 = std::runtime::mem::alloc(64);
  if buf == 0 {
    return 2;
  }

  while true {
    let r: std::io::IOResult = std::io::read_stdin(std::arrays::ByteSlice{ ptr: buf, len: 64 });
    match (r) {
      std::io::IOResult::Ok(n) => {
        if n == 0 {
          break;
        }

        let w_err: std::io::IOFailed? = std::io::write_all(std::runtime::io::STDOUT_FD, std::arrays::ByteSlice{ ptr: buf, len: n as i64 });
        if w_err != None {
          std::runtime::mem::free(buf);
          return 4;
        }
      },
      std::io::IOResult::Err(_) => {
        std::runtime::mem::free(buf);
        return 3;
      },
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
- Minimal fd-based async wrappers in `std::io::async`.
- Buffered fd-backed output for CLI tools.

## Core Interfaces
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

## Considerations
- Buffered readers and async buffered I/O wrappers.
- Broader async I/O surface beyond the shipped `std::io::async` wrappers:
 - richer socket and filesystem stream adapters,
 - stronger cancellation of in-flight operations,
 - and `select`-style waiting over mixed sources.
