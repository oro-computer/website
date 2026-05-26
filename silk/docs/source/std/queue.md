# `std::queue`

This module provides queue-oriented
containers built on a shared owning deque core.

The module exports:

- `Queue(T)`: a double-ended queue protocol over `T`.
- `FixedQueue(T)`: a queue protocol marker for queues that do not grow
 implicitly.
- `FIFOQueue(T)`: a dynamically growing first-in-first-out queue.
- `LIFOQueue(T)`: a dynamically growing last-in-first-out queue with stack-like
 `push` / `pop` aliases.
- `FixedFIFOQueue(T)`: a queue with explicit capacity growth via
 `reserve_additional`.
- `FixedLIFOQueue(T)`: the fixed-capacity/manual-growth companion to
 `LIFOQueue(T)`.

The current implementation uses a circular heap buffer with a logical front
index:

- `push_back` appends at the logical back.
- `push_front` prepends at the logical front.
- `shift_front` removes the logical front.
- `shift_back` removes the logical back.
- dynamic growth linearizes into a larger buffer only when capacity must grow.

That gives amortized O(1) front/back deque operations on the dynamic queues and
O(1) front/back operations on the fixed queues while they remain within
capacity. Iteration preserves logical order even when the live region wraps.

## Interfaces

```silk
interface Queue(T) {
  fn push_back (value: T) -> std::memory::OutOfMemory?;
  fn push_front (value: T) -> std::memory::OutOfMemory?;
  fn shift_front () -> T?;
  fn shift_back () -> T?;
  fn front () -> T?;
  fn back () -> T?;
}

interface FixedQueue(T) {
}
```

Notes:

- `front()` / `back()` return `T?` so empty queues can be queried without
 trapping.
- `FixedQueue(T)` is currently a marker interface in this subset. The concrete
 fixed queue structs still implement the full queue method surface plus the
 marker, but generic interface inheritance (`FixedQueue(T) extends Queue(T)`)
 is not accepted by the current checker for this generic case yet.
- The fixed-capacity variants still implement `ReserveAdditional`; “fixed”
 here means “does not grow implicitly during `push_*`”.

## Exported API
```silk
struct QueueIter(T) {
  ptr: u64,
  len: i64,
  index: i64,
  reverse: bool,
}

struct FIFOQueue(T) { ... }
struct FixedFIFOQueue(T) { ... }
struct LIFOQueue(T) { ... }
struct FixedLIFOQueue(T) { ... }
```

Common methods on all four queue structs:

```silk
public fn init (cap: i64) -> std::result::Result(Self, std::memory::AllocFailed);
public fn try_init (cap: i64) -> Self?;
public fn empty () -> Self;
public fn push_back (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn push_front (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn shift_front (mut self: &Self) -> T?;
public fn shift_back (mut self: &Self) -> T?;
public fn front (self: &Self) -> T?;
public fn back (self: &Self) -> T?;
public fn iter (self: &Self) -> QueueIter(T);
```

Flavor-specific aliases:

- `FIFOQueue(T)` / `FixedFIFOQueue(T)`:
 - `push(value)` aliases `push_back(value)`
 - `pop()` and `shift()` alias `shift_front()`
- `LIFOQueue(T)` / `FixedLIFOQueue(T)`:
 - `push(value)` aliases `push_back(value)`
 - `pop()` and `shift()` alias `shift_back()`

## Interface surface

Dynamic queues implement:

- `std::queue::Queue(T)`
- `std::interfaces::Len`
- `std::interfaces::Capacity`
- `std::interfaces::IsEmpty`
- `std::interfaces::Sized`
- `std::interfaces::Clear`
- `std::interfaces::ReserveAdditional`
- `std::interfaces::Drop`
- `std::interfaces::Iterator(T)` via destructive `next()` semantics

Fixed queues implement the same surface plus `std::queue::FixedQueue(T)`.

`is_empty()` is part of the intended fast state-query surface:

- new empty queues report `true`,
- queues with at least one element report `false`,
- and `clear()` / full draining restores `true`.

`clear()` is part of the intended owning-container contract here:

- it removes all live elements,
- preserves the current allocation/capacity,
- and resets the queue to an empty state so `front()` / `back()` return `None`
 and `is_empty()` returns `true`.

Iterator support is split intentionally:

- `iter()` returns a non-owning snapshot iterator `QueueIter(T)` over the
 current queue contents.
- Direct `Iterator(T)` conformance on the queue structs themselves is
 destructive:
 - FIFO queues consume from the front,
 - LIFO queues consume from the back.

The iterator walks logical queue order, not raw buffer order, so wrapped queue
contents still iterate in the expected FIFO/LIFO view.

That split preserves a useful `for item in queue.iter()` story without giving
up the explicit “consume this queue as an iterator” protocol surface.
