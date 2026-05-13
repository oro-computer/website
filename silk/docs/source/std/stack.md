# `std::stack`

This module provides stack-oriented
wrappers over `std::queue`’s deque core.

The module exports:

- `Stack(T)`: a dynamically growing stack.
- `FixedStack(T)`: a stack whose capacity grows only when
 `reserve_additional(...)` is called explicitly.

`Stack(T)` is a queue-shaped view over an internal LIFO queue:

- logical `front()` is the stack top,
- logical `back()` is the stack bottom,
- `top()` aliases `front()`,
- `bottom()` aliases `back()`,
- `push(value)` aliases `push_front(value)`,
- `pop()` / `shift()` alias `shift_front()`.

This means `Stack(T)` satisfies `std::queue::Queue(T)` while still presenting
the more familiar stack vocabulary.

Because the shared queue core is ring-buffer-backed, `Stack(T)` and
`FixedStack(T)` inherit the same O(1) front/back operations and logical-order
iteration over wrapped storage.

## Exported API
```silk
struct Stack(T) { ... }
struct FixedStack(T) { ... }
```

Common methods:

```silk
public fn init (cap: i64) -> Result(Self, std::memory::AllocFailed);
public fn try_init (cap: i64) -> Self?;
public fn empty () -> Self;
public fn push (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn pop (mut self: &Self) -> T?;
public fn shift (mut self: &Self) -> T?;
public fn push_front (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn push_back (mut self: &Self, value: T) -> std::memory::OutOfMemory?;
public fn shift_front (mut self: &Self) -> T?;
public fn shift_back (mut self: &Self) -> T?;
public fn front (self: &Self) -> T?;
public fn back (self: &Self) -> T?;
public fn top (self: &Self) -> T?;
public fn bottom (self: &Self) -> T?;
public fn iter (self: &Self) -> std::queue::QueueIter(T);
```

## Interface surface

`Stack(T)` implements:

- `std::queue::Queue(T)`
- `std::interfaces::Len`
- `std::interfaces::Capacity`
- `std::interfaces::IsEmpty`
- `std::interfaces::Sized`
- `std::interfaces::Clear`
- `std::interfaces::ReserveAdditional`
- `std::interfaces::Drop`
- `std::interfaces::Iterator(T)`

`FixedStack(T)` implements the same surface plus `std::queue::FixedQueue(T)`.

`is_empty()` follows the normal owning-container contract:

- a newly created stack is empty,
- pushing any element flips it to non-empty,
- and `clear()` or fully draining the stack restores emptiness.

`clear()` removes all stack elements while preserving the current storage
reservation. After `clear()`, `top()` and `bottom()` return `None`.

Like `std::queue`, the split between `iter()` and direct `Iterator(T)`
conformance is intentional:

- `iter()` is non-destructive,
- direct `next()` / `for x in stack` consume the stack from top to bottom.
