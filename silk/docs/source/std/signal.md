# `std::signal`

`std::signal` provides a small, pollable signal-watching surface intended for
terminal/TUI programs.

On hosted Linux targets, this module is backed by `signalfd(2)`, which exposes
pending signals as a readable file descriptor. This integrates naturally with:

- `std::runtime::event_loop::{fd_wait_readable2, fd_wait_readable_any, ...}`
- `std::sync::ChannelBorrow(T).wait_fd()`
- `std::abort_controller::AbortSignalBorrow.wait_fd()`

## `signalfd(2)` integration

The main type is `SignalFD`:

- `SignalFD.open(signo)` blocks `signo` in the calling thread, then returns a
  `SignalFD` whose `.wait_fd()` becomes readable when the signal is pending for
  the process.
- `SignalFD.read_signo()` reads one pending signal number from the fd.

### Important: thread signal masks

Signal masks are per-thread.

To reliably route a signal to a `signalfd(2)` across a multi-threaded program,
ensure the relevant signals are blocked in all threads that might otherwise
receive them.

In practice:

- call `SignalFD.open(...)` early in your program (before spawning `task fn`
  threads), and
- keep the returned `SignalFD` alive for as long as you want to observe the
  signal.

Newly-created threads inherit the parent thread’s signal mask, so blocking
signals early keeps delivery consistent.

## Example: `SIGWINCH` resize notifications

This pattern avoids polling terminal size in a loop:

```silk
import std::io;
import std::runtime::event_loop;
import std::runtime::io;
import std::runtime::mem;
import std::signal;

async fn main () -> int {
  let sfd = match std::signal::SignalFD.open(std::signal::SIGWINCH) {
    Ok(v) => v,
    Err(_) => return 1,
  };

  // Wait until a resize signal is pending.
  let fds_mem: u64 = std::runtime::mem::alloc(8);
  if fds_mem == 0 { return 2; }
  std::runtime::mem::store_u64(fds_mem, 0, sfd.wait_fd() as u64);

  let which: i64 = await std::runtime::event_loop::fd_wait_readable_any(fds_mem, 1);
  std::runtime::mem::free(fds_mem);
  if which != 0 { return 3; }

  // Now re-query terminal size and redraw.
  let _signo = match sfd.read_signo() {
    Ok(v) => v,
    Err(_) => return 4,
  };
  let _size: std::io::TTYSize? = std::io::tty_size(std::runtime::io::STDIN_FD);
  return 0;
}
```

## Portability

Today:

- hosted Linux targets: supported (`signalfd(2)`).
- other targets: `SignalFD.open*` returns an `IOFailed` error.

As more platforms are implemented, this module will extend to cover portable
signal waiting where possible.
