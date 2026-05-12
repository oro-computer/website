# Atomics



Silk atomics are compiler-backed operations for low-level thread
synchronization. They are distinct from ordinary loads/stores and from
`volatile` memory access:

- ordinary loads/stores are not synchronization operations,
- atomics synchronize between OS threads according to an explicit memory
 ordering,
- `volatile` remains for externally observed memory such as MMIO and must not
 be used as a replacement for atomics.

For ordinary application code, prefer `std::sync` primitives such as mutexes,
condition variables, channels, and cancellation tokens. Atomics are intended
for small low-level coordination patterns such as counters, readiness flags,
once-style state, and cheap cancellation flags.

## Ordering

The public ordering enum is `std::atomic::Ordering`:

```silk
export enum Ordering {
  Relaxed,
  Acquire,
  Release,
  AcqRel,
  SeqCst,
}
```

Meaning:

- `Relaxed` performs an atomic operation without establishing synchronization.
- `Acquire` prevents later memory operations from moving before the atomic
 operation.
- `Release` prevents earlier memory operations from moving after the atomic
 operation.
- `AcqRel` combines acquire and release behavior for read-modify-write
 operations.
- `SeqCst` participates in the single sequentially consistent order for all
 sequentially consistent atomics.

## Operation Rules

Atomic operations have operation-specific ordering contracts:

- `load` accepts `Relaxed`, `Acquire`, or `SeqCst`.
- `store` accepts `Relaxed`, `Release`, or `SeqCst`.
- `swap`, `fetch_add`, and `fetch_sub` accept any `Ordering`.
- `compare_exchange` accepts any success ordering, but the failure ordering
 must not be `Release` or `AcqRel`.
- `fence` accepts any `Ordering`; `Relaxed` is a no-op fence.

Invalid statically visible orderings are rejected by the checker with `E2127`.

```silk
import atomic from "std/atomic";

fn main () -> int {
  let mut value = atomic::AtomicU64.init(1);

  // error[E2127]: atomic loads cannot use Release or AcqRel
  let current = value.load(atomic::Ordering::Release);
  return current as int;
}
```

## Thread Safety

Atomic fields are task-safe when the containing type is otherwise task-safe.
This means a struct containing `AtomicBool` or `AtomicU64` can cross a `task`
boundary by value under the same task-safety rules as other structs composed of
task-safe fields.

Copying an atomic value by value copies the atomic storage. It does not create
shared ownership. To share one atomic cell across tasks, keep the owning value
alive in the parent scope and pass the module’s non-owning borrow view across
the task boundary.

`new` references remain non-atomic. The reference counting used for ordinary
`new` allocations is not made thread-safe by this feature. Thread-safe shared
ownership remains a separate future type, such as `Arc(T)`.

## Notes

The current hosted/native subset exposes:

- `std::atomic::Ordering`,
- `std::atomic::AtomicBool`,
- `std::atomic::AtomicBoolBorrow`,
- `std::atomic::AtomicU64`,
- `std::atomic::AtomicU64Borrow`,
- `std::atomic::fence`.

Lowering routes these operations through runtime symbols backed by native
compiler atomic builtins on the hosted POSIX path. They are not lowered as
ordinary Silk field loads or stores.
