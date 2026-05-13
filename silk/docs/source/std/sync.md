# `std::sync`

This module provides a small hosted baseline for
synchronization primitives used by the current `task` lowering on
`linux/x86_64`.

This is an intentionally narrow subset intended for early bring-up:

- It is intentionally small and conservative (a hosted baseline, not a final
 async runtime).
- It uses a simple **handle-based** representation backed by heap-allocated
 state and runtime-provided synchronization primitives (`std::runtime::sync`,
 which defaults to a POSIX/pthread backend in the shipped stdlib).
- All blocking operations block the **current OS thread**.

See also:

- [concurrency](?p=language/concurrency) (language-level `task`/`yield`/`await`)
- [task](?p=std/task) (task/runtime utilities)

## Thread Safety

`std::sync` is used from OS-thread-backed `task` code. The core pattern is:

- Owning handle types (`Mutex`, `Condvar`, `Channel(T)`, `CancellationToken`)
 implement `Drop` and are **move-only** in safe code (ownership transfers by
 value; they are not copyable).
- To share a handle across tasks without transferring ownership, prefer the
 `*Borrow` view types (for example `ChannelBorrow(T)`, `MutexBorrow`).
 `*Borrow` values are non-owning, copyable views; the owner must keep the
 backing handle alive for the duration of all borrows.
- For multi-producer patterns, pass `ChannelSender(T)` to worker tasks and
 clone it explicitly with `sender.clone()`; the channel auto-closes when the
 last sender is dropped.
- For shared ownership across tasks, use `Arc(T)`. `Arc(T)` uses atomic
 reference counting and is task-safe when `T` is task-safe to share.

## Exported API
```silk
module std::sync;

import interfaces from "std/interfaces";
enum SyncErrorKind {
  OutOfMemory,
  InvalidInput,
  Closed,
  Full,
  RuntimeFailed,
  Unknown,
}

export error SyncFailed {
  code: int,
}

// An atomically reference-counted owning handle.
struct Arc(T) {
  handle: u64,
}

// A non-owning, copyable view of an Arc handle.
struct ArcBorrow(T) {
  handle: u64,
}

type ArcResult(T) = Result(Arc(T), SyncFailed);

impl Arc(T) {
  public fn invalid () -> Arc(T);
  public fn new (value: T) -> ArcResult(T);
  public fn clone (self: &Arc(T)) -> Arc(T);
  public fn strong_count (self: &Arc(T)) -> u64;
  public fn is_valid (self: &Arc(T)) -> bool;
  public fn borrow (self: &Arc(T)) -> ArcBorrow(T);
}

impl ArcBorrow(T) {
  public fn is_valid (self: &ArcBorrow(T)) -> bool;
}

// A pthread-backed mutex handle.
struct Mutex {
  handle: u64,
}

impl Mutex {
  public fn invalid () -> Mutex;
  public fn is_valid (self: &Mutex) -> bool;
  public fn init () -> Result(Mutex, SyncFailed);
  public fn lock (self: &Mutex) -> SyncFailed?;
  public fn unlock (self: &Mutex) -> SyncFailed?;
  public fn destroy (mut self: &Mutex) -> void;
}

// A pthread-backed condition variable handle.
struct Condvar {
  handle: u64,
}

impl Condvar {
  public fn invalid () -> Condvar;
  public fn is_valid (self: &Condvar) -> bool;
  public fn init () -> Result(Condvar, SyncFailed);
  public fn wait (self: &Condvar, m: &Mutex) -> SyncFailed?;
  public fn signal (self: &Condvar) -> SyncFailed?;
  public fn broadcast (self: &Condvar) -> SyncFailed?;
  public fn destroy (mut self: &Condvar) -> void;
}

// A bounded channel of `T` values.
struct Channel(T) {
  handle: u64,
}

// A non-owning, copyable view of a channel handle.
struct ChannelBorrow(T) {
  handle: u64,
}

// A droppable, non-copyable producer handle for a channel.
struct ChannelSender(T) {
  handle: u64,
  sender_state: u64,
}

impl Channel(T) {
  public fn invalid () -> Channel(T);
  public fn init_default () -> Result(Channel(T), SyncFailed);
  public fn init (cap: int) -> Result(Channel(T), SyncFailed);
  public fn borrow (self: &Channel(T)) -> ChannelBorrow(T);
  public fn sender (self: &Channel(T)) -> Result(ChannelSender(T), SyncFailed);
  public fn cap (self: &Channel(T)) -> int;
  public fn is_closed (self: &Channel(T)) -> bool;
  public fn try_send (self: &Channel(T), value: T) -> SyncFailed?;
  public fn send (self: &Channel(T), value: T) -> SyncFailed?;
  public fn try_recv (self: &Channel(T)) -> T?;
  public fn recv (self: &Channel(T)) -> T?;
  public fn close (self: &Channel(T)) -> void;
  public fn destroy (mut self: &Channel(T)) -> void;
}

impl Channel(T) as std::interfaces::Len {
  public fn len (self: &Channel(T)) -> i64;
}

impl Channel(T) as std::interfaces::Capacity {
  public fn capacity (self: &Channel(T)) -> i64;
}

impl Channel(T) as std::interfaces::IsEmpty {
  public fn is_empty (self: &Channel(T)) -> bool;
}

impl ChannelBorrow(T) {
  public fn send (self: &ChannelBorrow(T), value: T) -> SyncFailed?;
  public fn wait_fd (self: &ChannelBorrow(T)) -> int?;
}

impl ChannelSender(T) {
  public fn clone (self: &ChannelSender(T)) -> Result(ChannelSender(T), SyncFailed);
  public fn send (self: &ChannelSender(T), value: T) -> SyncFailed?;
}

// A simple cancellation token (blocking wait).
struct CancellationToken {
  handle: u64,
}

// A non-owning, copyable view of a cancellation token handle.
struct CancellationTokenBorrow {
  handle: u64,
}

impl CancellationToken {
  public fn invalid () -> CancellationToken;
  public fn is_valid (self: &CancellationToken) -> bool;
  public fn init () -> Result(CancellationToken, SyncFailed);
  public fn borrow (self: &CancellationToken) -> CancellationTokenBorrow;
  public fn cancel (self: &CancellationToken) -> void;
  public fn is_cancelled (self: &CancellationToken) -> bool;
  public fn wait (self: &CancellationToken) -> void;
  public fn destroy (mut self: &CancellationToken) -> void;
}

impl CancellationTokenBorrow {
  public fn cancel (self: &CancellationTokenBorrow) -> void;
  public fn is_cancelled (self: &CancellationTokenBorrow) -> bool;
  public fn wait (self: &CancellationTokenBorrow) -> void;
}
```

Notes:

- `Arc(T)` is an owning handle and implements `Drop`. Cloning is explicit:
 `clone()` atomically increments the strong count, and dropping an `Arc(T)`
 atomically decrements it. The final release uses release/acquire
 synchronization, drops the stored payload exactly once using the concrete
 payload layout, and frees the backing allocation.
- The hosted backend stores concrete payload slots in the Arc allocation. This
 includes scalar payloads, multi-slot structs/enums, optionals, functions, and
 fixed arrays supported by the current hosted lowering subset.
- `Arc(T)` is task-safe only when `T` is task-safe to share. The checker applies
 the same conservative task-boundary rule to the concrete payload and rejects
 borrowed non-opaque references inside `Arc(T)`.
- `ArcBorrow(T)` is a non-owning view. It does not retain the allocation; the
 owning `Arc(T)` must outlive every derived borrow.
- `Arc(T)` does not make ordinary `new` allocations thread-safe. Use `Arc(T)`
 when shared ownership itself must cross OS-thread-backed tasks.
- `Mutex.init`, `Condvar.init`, and `CancellationToken.init` return
 `Result(...)`. `Channel(T).init` / `init_default` return `Result(...)`.
- `Channel(T).invalid()` returns an inert handle (`handle == 0`); operations treat it as closed/empty and return `InvalidInput` for sends.
- `CancellationToken.invalid()` returns an inert handle; it is treated as already cancelled so waits do not block.
- Owning handle types implement `Drop` and are moved by value (non-copyable).
 `*Borrow` view types are copyable and may be passed across tasks/threads, but
 do not manage lifetime.
- When sending a channel handle across a `task` boundary, prefer passing a
 non-owning view (`ChannelBorrow(T)`) obtained via `c.borrow()` so ownership
 stays with the original `Channel(T)`.
- For producer tasks, prefer using `ChannelSender(T)` created via
 `c.sender()` and cloned explicitly via `sender.clone()`:
 - `ChannelSender(T)` auto-closes the channel when the last sender is dropped,
 which prevents a common class of “receiver blocks forever” bugs.
 - `ChannelSender(T)` is non-copyable; cloning is explicit so the sender count
 stays correct for multi-producer patterns.
- When sending a cancellation token across a `task` boundary, prefer passing a
 non-owning view (`CancellationTokenBorrow`) obtained via `tok.borrow()` so
 ownership stays with the original `CancellationToken`.
- `Condvar.wait(self: &Condvar, m: &Mutex)` is called as `cv.wait(m)` — the
 compiler implicitly borrows the `m` binding for `&T` parameters (there is no
 general `&expr` operator in the Supported forms).
- `Channel(T).recv()` returns `None` once the channel is closed *and* empty.
- `Channel(T).try_send()` returns `Some(SyncFailed)` when the channel is closed
 or full.
- `Channel(T).try_recv()` returns `None` when the channel is empty. Use
 `is_closed()` to distinguish between “empty” and “closed and empty” when
 needed.
- `ChannelBorrow(T).wait_fd()` returns a file descriptor that becomes readable
 when the channel transitions from empty to non-empty, or when the channel is
 closed. This is intended for `poll(2)`/`select(2)`/`epoll(7)` style waiting
 (for example: wait on both a TTY fd and a channel at the same time).
 - `wait_fd()` returns `None` when the current runtime cannot provide a pollable
 channel handle.
 - Do not read from or close the returned fd. It is owned by the channel and
 is used as an internal wake mechanism; consuming bytes from it can
 desynchronize the readiness signal.

Example (wait on `/dev/tty` *or* a channel):

```silk
import io from "std/io";
import event_loop from "std/runtime/event_loop";
import sync from "std/sync";

export async fn main () -> int {
  let tty_fd: int = match (io::tty_open()) {
    Ok(fd) => fd,
    Err(_) => return 2,
  };

  let ch: sync::Channel(u64) = match (sync::Channel(u64).init(1)) {
    Ok(c) => c,
    Err(_) => return 3,
  };

  let r: sync::ChannelBorrow(u64) = ch.borrow();
  if let Some(wfd) = r.wait_fd() {
    // `which` is 0 when `tty_fd` is readable, 1 when the channel is readable.
    let which: i64 = await event_loop::fd_wait_readable2(tty_fd, wfd);
    if which == 1 {
      // Drain the channel (or observe close).
      let _ = r.try_recv();
    }

    // For more than two sources, use `fd_wait_readable_any(fds_ptr, fds_len)`
    // and pass an `i64[]` of fds.
  }

  return 0;
}
```
