# `std::atomic`

`std::atomic` provides the public Silk API for low-level atomic operations.

Prefer `std::sync` for ordinary synchronization. Use this module when a data
structure needs explicit lock-free coordination such as a counter, readiness
flag, or cancellation flag.

## Notes

Implemented on the hosted/native runtime subset:

- `Ordering`,
- `AtomicBool`,
- `AtomicBoolBorrow`,
- `AtomicU64`,
- `AtomicU64Borrow`,
- `fence`.

Other fixed-width atomic integer types are planned but not shipped in this
slice.

## Ordering

```silk
export enum Ordering {
  Relaxed,
  Acquire,
  Release,
  AcqRel,
  SeqCst,
}
```

Ordering contracts:

- `load` accepts `Relaxed`, `Acquire`, or `SeqCst`.
- `store` accepts `Relaxed`, `Release`, or `SeqCst`.
- `swap`, `fetch_add`, and `fetch_sub` accept any ordering.
- `compare_exchange` failure ordering must not be `Release` or `AcqRel`.
- `fence` accepts any ordering; `Relaxed` has no synchronization effect.

Invalid statically visible orderings are rejected with `E2127`.

## `AtomicU64`

```silk
let mut counter = std::atomic::AtomicU64.init(0);
let old = counter.fetch_add(1, std::atomic::Ordering::AcqRel);
let now = counter.load(std::atomic::Ordering::Acquire);
```

Public methods:

- `init(value: u64) -> AtomicU64`
- `borrow(self: &AtomicU64) -> AtomicU64Borrow`
- `load(self: &AtomicU64, order: Ordering) -> u64`
- `store(mut self: &AtomicU64, value: u64, order: Ordering) -> void`
- `swap(mut self: &AtomicU64, value: u64, order: Ordering) -> u64`
- `fetch_add(mut self: &AtomicU64, value: u64, order: Ordering) -> u64`
- `fetch_sub(mut self: &AtomicU64, value: u64, order: Ordering) -> u64`
- `compare_exchange(mut self: &AtomicU64, expected: u64, desired: u64,
 success: Ordering, failure: Ordering) -> bool`

`AtomicU64Borrow` is a non-owning copyable view intended to cross `task`
boundaries while the owning `AtomicU64` remains alive.

## `AtomicBool`

```silk
let mut ready = std::atomic::AtomicBool.init(false);
ready.store(true, std::atomic::Ordering::Release);
```

Public methods:

- `init(value: bool) -> AtomicBool`
- `borrow(self: &AtomicBool) -> AtomicBoolBorrow`
- `load(self: &AtomicBool, order: Ordering) -> bool`
- `store(mut self: &AtomicBool, value: bool, order: Ordering) -> void`
- `swap(mut self: &AtomicBool, value: bool, order: Ordering) -> bool`
- `compare_exchange(mut self: &AtomicBool, expected: bool, desired: bool,
 success: Ordering, failure: Ordering) -> bool`

`AtomicBoolBorrow` is the corresponding non-owning task-boundary view.

## Task Sharing

Do not pass `&AtomicU64` or `&AtomicBool` directly to a `task fn`; ordinary
references are rejected at task boundaries. Pass `AtomicU64Borrow` or
`AtomicBoolBorrow` instead:

```silk
import atomic from "std/atomic";

task fn worker (counter: std::atomic::AtomicU64Borrow) -> int {
  counter.fetch_add(1, std::atomic::Ordering::AcqRel);
  return 0;
}
```

The owner must outlive all borrow views.

## Runtime Backing

The public module delegates to `std::runtime::atomic`, which delegates to the
hosted POSIX runtime shim in the shipped stdlib. The runtime shim uses native
compiler atomic builtins and preserves the requested ordering on supported
hosted targets.
