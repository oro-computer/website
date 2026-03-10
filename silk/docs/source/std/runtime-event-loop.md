# `std::runtime::event_loop`

Status: **Implemented subset (hosted `linux/x86_64`)**.

This module exposes the low-level hosted executor/event-loop surface used by
compiler-lowered `async` code and by async-aware stdlib helpers.

Most downstream code should prefer higher-level wrappers such as
`std::task::sleep_ms_async` and `std::io::async`. Reach for
`std::runtime::event_loop` directly when you need:

- fd readiness waits,
- manual polling of the hosted executor,
- or explicit integration with pollable resources such as
  `AbortSignalBorrow.wait_fd()` and `ChannelBorrow.wait_fd()`.

See also:

- `docs/compiler/async-runtime.md`
- `docs/std/runtime.md`
- `docs/std/task.md`
- `docs/std/io.md`

## Current Surface

The current hosted subset includes:

- awaitable readiness helpers:
  - `fd_wait_readable(fd)`
  - `fd_wait_writable(fd)`
  - `fd_wait_readable2(fd0, fd1)`
  - `fd_wait_readable_any(fds_ptr, fds_len)`
- abort-aware helpers:
  - `sleep_ms_abortable(ms, sig) -> bool`
  - `fd_wait_readable_abortable(fd, sig) -> bool`
  - `fd_wait_writable_abortable(fd, sig) -> bool`
- an explicit executor handle surface:
  - `init()`
  - `Handle.poll(timeout_ms)`
  - `Handle.wake()`
  - `Handle.deinit()`

Current semantics documented elsewhere in the site:

- `await fd_wait_readable2(fd0, fd1)` resolves to `0` when `fd0` becomes
  readable, `1` when `fd1` becomes readable, and a negative value on failure
  (`-errno` in the hosted runtime).
- `await fd_wait_readable_any(fds_ptr, fds_len)` resolves to the ready-fd index
  `0..fds_len-1`, or a negative value on failure.
- `Handle.poll()` / `Handle.deinit()` are thread-affine: call them from the same
  OS thread that created the handle.
- Only one global hosted executor/event-loop instance may be active at a time.

## Cancellation

`std::runtime::event_loop` is the lowest-level place where abort-aware waiting
is currently documented.

- `sleep_ms_abortable` and the `fd_wait_*_abortable` helpers return `true` when
  the awaited operation completed normally and `false` when cancellation wins.
- For readiness waits, cancellation can be stronger than a simple
  “check-before/check-after” model:
  - when `AbortSignalBorrow.wait_fd()` returns a pollable fd, the runtime can
    wait on both the target fd and the abort fd and cancel an in-flight
    readiness wait,
  - when no pollable abort fd is available, the helpers fall back to
    cooperative before/after checks.
- Higher-level `std::io::async::{read_abortable,write_abortable}` wrappers are
  still more conservative: they check cancellation around each read/write
  attempt rather than interrupting an in-flight operation.

## Examples

### Wait for either of two fds

```silk
import event_loop from "std/runtime/event_loop";

async fn wait_either (fd0: int, fd1: int) -> int {
  let which: i64 = await event_loop::fd_wait_readable2(fd0, fd1);
  if which < 0 { return -1; }
  return which as int;
}
```

### Wait on a dynamic fd set

```silk
import std::runtime::event_loop;

async fn wait_any (fds_mem: u64, fds_len: i64) -> int {
  let which: i64 = await std::runtime::event_loop::fd_wait_readable_any(fds_mem, fds_len);
  if which < 0 { return -1; }
  return which as int;
}
```
