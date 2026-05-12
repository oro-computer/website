# Tutorial 6: Async I/O + Streams + Abort Signals

This tutorial shows how to compose the current concurrency + stdlib building
blocks into practical I/O pipelines:

- `async fn` / `await` for cooperative scheduling,
- `task fn` / `yield` for OS-thread parallelism,
- `std::io::async` for fd readiness + read/write loops,
- `std::stream` for in-memory byte streams and transform stages,
- `std::abort_controller` for cooperative cancellation.

For full language semantics and limitations, see:

- [concurrency](?p=language/concurrency)
- [abort controller](?p=std/abort-controller)
- [stream](?p=std/stream)
- [io](?p=std/io) (`std::io::async` and `std::io::stream`)

## 1) AbortController: a single cancellation story

`std::abort_controller` provides WHATWG-style `AbortController` /
`AbortSignalBorrow` values:

- own the controller in one place,
- pass `AbortSignalBorrow` into work that should stop early,
- abort once, from any thread/task.

Minimal pattern:

```silk
import abort_controller from "std/abort_controller";

task fn worker (sig: abort_controller::AbortSignalBorrow) -> int {
  if sig.is_aborted() { return 0; }
  return 1;
}

async fn main () -> int {
  let controller = match abort_controller::AbortController.init() {
    Ok(v) => v,
    Err(_) => return 1,
  };

  task {
    controller.abort();
    let rc: int = yield worker(controller.signal());
    return rc;
  }
}
```

## 2) High-quality async I/O (`std::io::async`)

`std::io::async` is a small layer over the hosted event loop:

1. wait for fd readability/writability (`std::runtime::event_loop`),
2. call the existing synchronous `std::io::{read,write}` functions,
3. retry on `WouldBlock` / `Interrupted`.

Important rule: `write` may write fewer bytes than requested. “High-quality”
I/O loops must handle partial writes (and partial reads when you need an exact
length).

The core readiness-wait shape is:

```silk
import abort_controller from "std/abort_controller";
import event_loop from "std/runtime/event_loop";

async fn wait_readable_or_abort (fd: int, sig: abort_controller::AbortSignalBorrow) -> int {
  let abort_fd = match sig.wait_fd() {
    Some(v) => v,
    None => return 1,
  };

  let which: i64 = await event_loop::fd_wait_readable2(fd, abort_fd);
  if which == 0 { return 0; }
  return 1;
}
```

Notes (Supported forms):

- Aborts are cooperative, but the details depend on the layer:
 - `std::runtime::event_loop::fd_wait_readable_abortable` can interrupt an
 in-flight readiness wait when `AbortSignalBorrow.wait_fd()` is available.
 - `std::io::async::{read_abortable,write_abortable}` still observe aborts
 conservatively around each I/O attempt.
- This example intentionally avoids `task fn` threads. In the current hosted
 runtime, spawning stackful async coroutines in a multi-threaded process is
 not reliable yet. Keep `std::io::async`-based I/O pipelines single-threaded
 for now, and use `task fn` for thread-based parallelism in separate examples
 (see section 1).

## 3) Stream pipelines (`std::stream`) + fd adapters

`std::stream` provides byte streams that are easy to compose:

- `PassThroughStream` gives you a paired in-memory pipe (`WritableStream` → `ReadableStream`).
- `TransformStream` gives you a paired transform stage:
 - producers write to `writable`,
 - a transformer task reads from `transform_readable` and writes to `transform_writable`,
 - consumers read from `readable`.

To connect OS resources to streams:

- `std::io::stream` pipes fd ↔ stream (`ReadableStream` / `WritableStream`).

Minimal wiring:

```silk
import stream from "std/stream";

async fn main () -> int {
  task {
    let mut t = match stream::TransformStream.init_default() {
      Ok(v) => v,
      Err(_) => return 1,
    };

    let input = t.take_writable();
    let output = t.take_readable();
    let transform_in = t.take_transform_readable();
    let transform_out = t.take_transform_writable();

    // Producers write to `input`.
    // A transformer task reads from `transform_in` and writes to `transform_out`.
    // Consumers read from `output`.
    input.close();
    output.destroy();
    transform_in.destroy();
    transform_out.destroy();
    return 0;
  }
}
```

## Next steps

- For network I/O, start with [networking](?p=std/networking)
 (`std::net::stream` provides `TcpStream` ↔ stream adapters).
- For low-level readiness waits and manual executor driving, read
 [runtime event loop](?p=std/runtime).
- For compile-time proofs around bounds, invariants, and contracts, continue to
 [Tutorial 7: Formal Silk in real code](?p=usage/tutorials/07-formal-silk).
