# Tutorial 6: Async I/O + Streams + Abort Signals

This tutorial shows how to compose the current concurrency + stdlib building
blocks into practical I/O pipelines:

- `async fn` / `await` for cooperative scheduling,
- `task fn` / `yield` for OS-thread parallelism,
- `std::io::async` for fd readiness + read/write loops,
- `std::stream` for in-memory byte streams and transform stages,
- `std::abort_controller` for cooperative cancellation.

For full language semantics and limitations, see:

- `docs/language/concurrency.md`
- `docs/std/abort-controller.md`
- `docs/std/stream.md`
- `docs/std/io.md` (`std::io::async` and `std::io::stream`)

## 1) AbortController: a single cancellation story

`std::abort_controller` provides WHATWG-style `AbortController` /
`AbortSignalBorrow` values:

- own the controller in one place,
- pass `AbortSignalBorrow` into work that should stop early,
- abort once, from any thread/task.

See a runnable program:

- `examples/feature_concurrency_abort_controller.slk`

Build and run (from a checkout of the Silk compiler repository):

```bash
silk build examples/feature_concurrency_abort_controller.slk -o build/abort_controller
./build/abort_controller
```

## 2) High-quality async I/O (`std::io::async`)

`std::io::async` is a small layer over the hosted event loop:

1. wait for fd readability/writability (`std::runtime::event_loop`),
2. call the existing synchronous `std::io::{read,write}` functions,
3. retry on `WouldBlock` / `Interrupted`.

Important rule: `write` may write fewer bytes than requested. “High-quality”
I/O loops must handle partial writes (and partial reads when you need an exact
length).

See a runnable example that:

- creates two pipes,
- runs a pure-`async` producer/copy/consumer pipeline,
- composes the pipeline with `await * [...]`,
- aborts after a timeout using `AbortController` (cooperative cancellation),
- uses a `write_all_abortable` loop to handle partial writes correctly.

Example:

- `examples/feature_io_async_pipe_copy_abortable.slk`

Build and run (from a checkout of the Silk compiler repository):

```bash
silk build examples/feature_io_async_pipe_copy_abortable.slk -o build/async_copy
./build/async_copy
```

Notes (current subset):

- Aborts are cooperative: they are checked before/after awaited waits.
  Aborts do not yet interrupt an in-flight sleep or fd wait.
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

See a runnable example that builds a pipeline:

fd → stream → uppercase transform → stream → fd

Example:

- `examples/feature_stream_transform_uppercase_fd.slk`

Build and run (from a checkout of the Silk compiler repository):

```bash
silk build examples/feature_stream_transform_uppercase_fd.slk -o build/stream_upper
./build/stream_upper
```

## Next steps

- If you want a quick, runnable reference, prefer `tests/silk/pass_std_io_async_*.slk`
  and `tests/silk/pass_std_*_stream_*.slk` alongside the examples.
- For network I/O, start with `examples/std_net_tcp_loopback.slk` and
  `docs/std/networking.md` (`std::net::stream` provides `TcpStream` ↔ stream adapters).
