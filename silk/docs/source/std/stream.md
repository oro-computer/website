# `std::stream`

Status: **Implemented subset**. This module provides a Web Streams-inspired API
for **byte streams** designed to work well with Silk’s `async`/`task` model.

The core goals of the current subset are:

- **Ergonomic piping** between producers and consumers.
- **Backpressure** via bounded buffering.
- **Safe chunk ownership** across tasks using an owned `Bytes` type (no borrowed
  slice lifetime hazards).

Runtime note (current subset):

- `ReadableStream.read()` / `WritableStream.write()` are **blocking OS-thread**
  operations implemented with mutex/condvar primitives.

See also:

- `docs/language/concurrency.md` (tasks, `yield`, structured blocks)
- `docs/std/sync.md` (mutex/condvar/channel; same blocking baseline)

## Implemented API

```silk
module std::stream;

import std::arrays;
import std::buffer;
import std::interfaces;
import std::memory;
import std::result;

export enum StreamErrorKind {
  OutOfMemory,
  InvalidInput,
  Closed,
  Full,
  Cancelled,
  Aborted,
  RuntimeFailed,
  Unknown,
}

export error StreamFailed {
  code: int,
}

impl StreamFailed {
  public fn kind (self: &StreamFailed) -> StreamErrorKind;
}

// Owned, immutable byte chunks.
export struct Bytes {
  handle: u64,
}

export type BytesResult = std::result::Result(Bytes, std::memory::AllocFailed);

impl Bytes {
  public fn empty () -> Bytes;
  public fn from_handle (handle: u64) -> Bytes;
  public fn as_slice (self: &Bytes) -> std::arrays::ByteSlice;
  public fn copy_from (slice: std::arrays::ByteSlice) -> BytesResult;
  public fn copy_from_string (s: string) -> BytesResult;
  public fn take_from_buffer (mut buf: &std::buffer::BufferU8) -> BytesResult;
}

impl Bytes as std::interfaces::Len {
  public fn len (self: &Bytes) -> i64;
}

impl Bytes as std::interfaces::IsEmpty {
  public fn is_empty (self: &Bytes) -> bool;
}

impl Bytes as std::interfaces::Sized {
  public fn size (self: &Bytes) -> usize;
}

// Read outcomes.
export enum Read {
  Done,
  Pending,
  // Bytes are transferred as raw handles; wrap with `Bytes.from_handle(handle)`.
  Chunk(u64),
}

export type ReadResult = std::result::Result(Read, StreamFailed);

// Readable end.
export struct ReadableStream {
  handle: u64,
}

impl ReadableStream {
  public fn invalid () -> ReadableStream;
  public fn is_valid (self: &ReadableStream) -> bool;
  public fn cap (self: &ReadableStream) -> int;
  public fn len (self: &ReadableStream) -> int;
  public fn is_closed (self: &ReadableStream) -> bool;
  public fn read (self: &ReadableStream) -> ReadResult;
  public fn try_read (self: &ReadableStream) -> ReadResult;
  public fn cancel (self: &ReadableStream) -> void;
  public fn destroy (mut self: &ReadableStream) -> void;
}

// Writable end.
export struct WritableStream {
  handle: u64,
}

impl WritableStream {
  public fn invalid () -> WritableStream;
  public fn is_valid (self: &WritableStream) -> bool;
  public fn cap (self: &WritableStream) -> int;
  public fn len (self: &WritableStream) -> int;
  public fn is_closed (self: &WritableStream) -> bool;
  public fn write (self: &WritableStream, mut chunk: Bytes) -> StreamFailed?;
  public fn try_write (self: &WritableStream, mut chunk: Bytes) -> StreamFailed?;
  public fn close (self: &WritableStream) -> void;
  public fn abort (self: &WritableStream, err: StreamFailed) -> void;
  public fn destroy (mut self: &WritableStream) -> void;
}

// A paired in-memory stream (writable → readable).
export struct PassThroughStream {
  readable: ReadableStream,
  writable: WritableStream,
}

export type PassThroughResult = std::result::Result(PassThroughStream, StreamFailed);

impl PassThroughStream {
  public fn init_default () -> PassThroughResult;
  public fn init (cap: int) -> PassThroughResult;
  public fn take_readable (mut self: &PassThroughStream) -> ReadableStream;
  public fn take_writable (mut self: &PassThroughStream) -> WritableStream;
}

// Transformer output.
export type TransformBytesResult = std::result::Result(Bytes, StreamFailed);

// A paired transform stage.
export struct TransformStream {
  readable: ReadableStream,
  writable: WritableStream,
  transform_readable: ReadableStream,
  transform_writable: WritableStream,
}

export type TransformResult = std::result::Result(TransformStream, StreamFailed);

impl TransformStream {
  public fn init_default () -> TransformResult;
  public fn init (cap: int) -> TransformResult;
  public fn init_with_caps (cap_in: int, cap_out: int) -> TransformResult;
  public fn take_readable (mut self: &TransformStream) -> ReadableStream;
  public fn take_writable (mut self: &TransformStream) -> WritableStream;
  public fn take_transform_readable (mut self: &TransformStream) -> ReadableStream;
  public fn take_transform_writable (mut self: &TransformStream) -> WritableStream;
}

// Pipe a readable into a writable until done.
export fn pipe_to (mut src: ReadableStream, mut dst: WritableStream) -> std::result::Result(int, StreamFailed);

// Pipe until done or until aborted.
export fn pipe_to_abortable (
  mut src: ReadableStream,
  mut dst: WritableStream,
  sig: std::abort_controller::AbortSignalBorrow?
) -> std::result::Result(int, StreamFailed);
```

## Semantics

### Backpressure

Each stream has a bounded in-memory queue. The `cap` is expressed in **chunks**
(`Bytes` values), not bytes:

- `PassThroughStream.init(cap)` / `TransformStream.init(cap)` require `cap > 0`
  (otherwise they return `Err(StreamFailed)` with `kind() == InvalidInput`).
- `WritableStream.write()` blocks while the queue is full.
- `ReadableStream.read()` blocks while the queue is empty (until closed or errored).

### Close vs cancel vs abort

- `WritableStream.close()`:
  - graceful end-of-stream,
  - readers drain remaining buffered chunks and then observe `Read::Done`.
- `ReadableStream.cancel()`:
  - marks the stream cancelled,
  - discards buffered chunks,
  - causes writers to fail with a `Cancelled` error.
- `WritableStream.abort(err)`:
  - marks the stream aborted with `err`,
  - discards buffered chunks,
  - causes readers to return `Err(err)` from `read` / `try_read`.

### Transform streams

`TransformStream` models a Web Streams-style transform stage.

In the current compiler subset, `std::stream` does **not** attach a transformer
callback internally. Instead, `TransformStream` exposes two bounded pipes and
expects you to run the transform loop in a task:

- input pipe: producers write to `writable`, transformer reads from
  `transform_readable`,
- output pipe: transformer writes to `transform_writable`, consumers read from
  `readable`.

This design composes naturally with task-based structured concurrency: run the
transform loop in a `task` and rely on backpressure to bound memory.

## Usage patterns

### Producer → consumer (tasks)

```silk
import std::stream;

task fn producer (w: std::stream::WritableStream) -> int { ... }
task fn consumer (r: std::stream::ReadableStream) -> int { ... }

async fn main () -> int {
  task {
    let pt_r = std::stream::PassThroughStream.init_default();
    if pt_r.is_err() { return 1; }
    let mut pt: std::stream::PassThroughStream = match (pt_r) {
      Ok(v) => v,
      Err(_) => std::stream::PassThroughStream{
        readable: std::stream::ReadableStream.invalid(),
        writable: std::stream::WritableStream.invalid(),
      },
    };

    let w = pt.take_writable();
    let r = pt.take_readable();

    let hp = producer(w);
    let hc = consumer(r);

    let rp: int = yield hp;
    let rc: int = yield hc;
    if rp != 0 { return rp; }
    if rc != 0 { return rc; }
    return 0;
  }
}
```

### Transform stage (tasks)

`TransformStream` is a pair of pipes intended to be driven by a transformer task.
Typical wiring:

- producer writes to `take_writable()`,
- transformer reads from `take_transform_readable()` and writes to
  `take_transform_writable()`,
- consumer reads from `take_readable()`.

### File I/O adapters (`std::fs`)

`std::fs` provides task-based helpers for piping files into/out of streams:

```silk
import std::fs;
import std::fs::stream;
import std::stream;

async fn main () -> int {
  task {
    let pt_r: std::stream::PassThroughResult = std::stream::PassThroughStream.init(2);
    if pt_r.is_err() { return 1; }
    let mut pt: std::stream::PassThroughStream = match (pt_r) {
      Ok(v) => v,
      Err(_) => std::stream::PassThroughStream{
        readable: std::stream::ReadableStream.invalid(),
        writable: std::stream::WritableStream.invalid(),
      },
    };

    let w = pt.take_writable();
    let r = pt.take_readable();

    let hr = std::fs::stream::pipe_file_to_stream("input.txt", w, 4096);
    let hw = std::fs::stream::pipe_stream_to_file(r, "output.txt", 420);

    let rr: std::stream::PipeResult = yield hr;
    let rw: std::stream::PipeResult = yield hw;
    if rr.is_err() { return 2; }
    if rw.is_err() { return 3; }
    return 0;
  }
}
```

### Piping

`pipe_to` is a structured copy loop:

- closes `dst` when `src` ends,
- aborts/cancels on error.

To make piping cooperatively cancellable, use `pipe_to_abortable` with an
`std::abort_controller::AbortSignalBorrow`. In the current subset, aborts are
observed between read/write steps; they do not yet interrupt a blocking
`ReadableStream.read()` call.

```silk
import std::stream;

fn run_pipeline (src: std::stream::ReadableStream, dst: std::stream::WritableStream) -> int {
  let r = std::stream::pipe_to(src, dst);
  return match (r) {
    Ok(_) => 0,
    Err(_) => 1,
  };
}
```

## Notes

- The current subset uses blocking primitives; it is intended to become
  suspension-friendly once the async runtime exists.
- Drop semantics are designed to avoid leaked pipes:
  - dropping `ReadableStream` cancels the stream (writers start failing),
  - dropping `WritableStream` closes the stream
    (readers observe `Read::Done` after draining).
- `PassThroughStream.take_readable` / `take_writable` exist to make ownership
  transfer ergonomic in the current subset (moving out of struct fields is
  limited).
