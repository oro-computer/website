# `std::sync`

Status: **Implemented subset**. This module provides a small hosted baseline for
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

- `docs/language/concurrency.md` (language-level `task`/`yield`/`await`)
- `docs/std/task.md` (task/runtime utilities)

## Implemented API

```silk
module std::sync;

import std::interfaces;
import std::result;

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

// A pthread-backed mutex handle.
struct Mutex {
  handle: u64,
}

impl Mutex {
  public fn invalid () -> Mutex;
  public fn is_valid (self: &Mutex) -> bool;
  public fn init () -> std::result::Result(Mutex, SyncFailed);
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
  public fn init () -> std::result::Result(Condvar, SyncFailed);
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

impl Channel(T) {
  public fn invalid () -> Channel(T);
  public fn init_default () -> std::result::Result(Channel(T), SyncFailed);
  public fn init (cap: int) -> std::result::Result(Channel(T), SyncFailed);
  public fn borrow (self: &Channel(T)) -> ChannelBorrow(T);
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
  public fn init () -> std::result::Result(CancellationToken, SyncFailed);
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

- `Mutex.init`, `Condvar.init`, and `CancellationToken.init` return
  `Result(...)`. `Channel(T).init` / `init_default` return `Result(...)`.
- `Channel(T).invalid()` returns an inert handle (`handle == 0`); operations treat it as closed/empty and return `InvalidInput` for sends.
- `CancellationToken.invalid()` returns an inert handle; it is treated as already cancelled so waits do not block.
- Handle types are trivially copyable in the current language subset; copying a
  handle duplicates the pointer. Destroying (or dropping) any copy invalidates
  the others.
- When sending a channel handle across a `task` boundary, prefer passing a
  non-owning view (`ChannelBorrow(T)`) obtained via `c.borrow()` so ownership
  stays with the original `Channel(T)`.
- When sending a cancellation token across a `task` boundary, prefer passing a
  non-owning view (`CancellationTokenBorrow`) obtained via `tok.borrow()` so
  ownership stays with the original `CancellationToken`.
- `Condvar.wait(self: &Condvar, m: &Mutex)` is called as `cv.wait(m)` — the
  compiler implicitly borrows the `m` binding for `&T` parameters (there is no
  general `&expr` operator in the current subset).
- `Channel(T).recv()` returns `None` once the channel is closed *and* empty.
- `Channel(T).try_send()` returns `Some(SyncFailed)` when the channel is closed
  or full.
- `Channel(T).try_recv()` returns `None` when the channel is empty. Use
  `is_closed()` to distinguish between “empty” and “closed and empty” when
  needed.
