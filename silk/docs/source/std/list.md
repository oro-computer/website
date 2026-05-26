# `std::list`

This module provides list-shaped wrappers
 over the queue core from `std::queue`.

The module exports:

- `List(T)`: a dynamically growing ordered list with front/back operations.
- `FixedList(T)`: the manual-growth fixed-capacity companion.

The current implementation is an owning ring-buffer-backed container rather
than a linked list. That is intentional:

- it matches the current compiler/runtime subset cleanly,
- it shares storage and ownership behavior with the queue/stack modules,
- and it provides the requested list vocabulary without introducing a second
 allocator/intrusive-node model.

Front/back insert/remove operations therefore reuse the queue core’s circular
storage behavior:

- `append` / `push_back` are amortized O(1),
- `prepend` / `push_front` are amortized O(1),
- `shift_front` / `shift_back` are amortized O(1) on dynamic lists and O(1)
 on fixed lists within capacity,
- and iteration still follows logical list order even when the live region is
 wrapped in the underlying buffer.

## Exported API
```silk
struct List(T) { ... }
struct FixedList(T) { ... }
```

Common methods:

```silk
public fn init (cap: i64) -> std::result::Result(Self, std::memory::AllocFailed);
public fn try_init (cap: i64) -> Self?;
public fn empty () -> Self;
public fn push (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn append (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn prepend (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn pop (mut self: &Self) -> T?;
public fn shift (mut self: &Self) -> T?;
public fn push_back (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn push_front (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn shift_front (mut self: &Self) -> T?;
public fn shift_back (mut self: &Self) -> T?;
public fn front (self: &Self) -> T?;
public fn back (self: &Self) -> T?;
public fn first (self: &Self) -> T?;
public fn last (self: &Self) -> T?;
public fn iter (self: &Self) -> std::queue::QueueIter(T);
```

Aliases:

- `first()` aliases `front()`
- `last()` aliases `back()`
- `push(value)` aliases `push_back(value)`
- `append(value)` aliases `push_back(value)`
- `prepend(value)` aliases `push_front(value)`
- `pop()` / `shift()` alias `shift_front()`

## Interface surface

`List(T)` implements:

- `std::queue::Queue(T)`
- `std::interfaces::Len`
- `std::interfaces::Capacity`
- `std::interfaces::IsEmpty`
- `std::interfaces::Sized`
- `std::interfaces::Clear`
- `std::interfaces::ReserveAdditional`
- `std::interfaces::Drop`
- `std::interfaces::Iterator(T)`

`FixedList(T)` implements the same surface plus `std::queue::FixedQueue(T)`.

`is_empty()` follows the normal owning-container contract:

- a newly created list is empty,
- any successful append/prepend/push operation makes it non-empty,
- and `clear()` or fully consuming the list restores emptiness.

`clear()` removes all list elements while preserving the current storage
reservation. After `clear()`, `first()` and `last()` return `None`.

As with the queue and stack modules:

- `iter()` returns a non-destructive iterator snapshot,
- direct `Iterator(T)` conformance consumes from front to back.
