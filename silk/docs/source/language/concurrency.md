# Concurrency

Concurrency in Silk is built around two orthogonal function modifiers:

- `async` — marks a function as pausable/awaitable (concurrency),
- `task` — marks a function as safe to execute on a worker pool (parallelism),

plus structured concurrency blocks (`async { ... }` and `task { ... }`)
intended to provide **structured concurrency**.

- The runtime can manage a thread pool to execute tasks.
- The compiler is intended to enforce task-safety rules when values cross task
  boundaries (Send/Sync-like constraints).

## Implementation Status (Current Compiler)

This document describes the **language design** for concurrency and the subset
implemented by the compiler/runtime today.

### Implemented Subset

- Parsing of `task fn`, `async fn`, and `async task fn` / `task async fn`.
- Parsing of `yield <expr>` and `yield * <expr>` (see `yield` below).
- Parsing of `await * <expr>` as a unary `await` applied to a unary `*`
  operand (see `await` below).
- Calling a function with a concurrency discipline produces a handle:
  - calling a `task fn` produces `Task(T)`,
  - calling an `async fn` produces `Promise(T)`,
  - calling an `async task fn` produces `Promise(Task(T))`,
  where `T` is the function’s declared surface result type.
- `yield` is implemented with two forms:
  - **send** (`yield <value>;`) inside a task: writes one task value (convertible
    to the enclosing task’s `T`) to the task’s receiver and continues execution.
    This form is only permitted inside a `task fn` / `async task fn` body.
  - **receive** (`yield <task_handle>`) in value position: blocks until the task
    produces its next value and yields `T`.
- `yield` on a temporary task handle is eager in the current subset:
  - `yield <task_expr>` where `<task_expr>` is not a named handle drains the
    task (joining thread-per-call tasks) and yields its final value `T` (so the
    temporary handle does not leak).
- `yield * <task_handle>` in value position drains a task:
  - `yield * Task(T)` receives **all** remaining values from the task, joins
    the worker thread (thread-per-call tasks), and yields a collected `T[]`
    result (with the task’s final return value as the last element). Pooled
    tasks (`attr(task=pool)`) skip the join.
- `yield * <task_handle>;` as a statement inside a task function forwards values:
  - drains the right-hand task and forwards all remaining values to the
    enclosing task’s receiver, then joins/cleans up the drained task.
- `await <expr>` is implemented as a Promise unwrap operation:
  - `await Promise(T)` unwraps and yields `T`,
  - `await Promise(Task(T))` unwraps and yields `Task(T)`,
  - `await Task(T)` is rejected (use `yield` / `yield *` for task values).
- `await * <promises>` unwraps a collection of promises:
  - `await * Promise(T)[]` yields a collected `T[]` by awaiting each promise,
  - `await * Promise(T)` is rejected (the `*` form requires a collection).
- `await` and the structured block form are still **async-context-only**:
  - `await` is only allowed inside functions declared with `async` (including
    `async task fn`),
  - `async { ... }` and `task { ... }` are only allowed inside functions declared
    with `async`.
  - `async loop { ... }` and `task loop { ... }` are only allowed inside functions
    declared with `async`.
- `async { ... }` / `task { ... }` are accepted as structured concurrency surface
  forms, but in the current subset they still establish lexical scopes only (no
  scheduler behavior yet).
- `yield` is **task-context-only**:
  - `yield` is only allowed inside `task` functions (`task fn` / `async task fn`)
    and inside `task { ... }` / `task loop { ... }` blocks.
- Initial task-safety rules are enforced at the `task fn` boundary:
  - `task fn` / `async task fn` parameter and result types must not contain
    non-opaque reference types (`&T`), including within structs and optionals.
  - references to opaque structs (types declared as `struct Name;`) are permitted
    (opaque structs are handle types and cannot be dereferenced or field-accessed
    in Silk).
  - `Task(T)` and `Promise(T)` handles are permitted at task boundaries, but
    their inner `T` must itself satisfy the task-safety rule above. This
    supports patterns like `Task(Promise(T))` (for tasks that produce promises)
    and `await * yield * t` for `t: Task(Promise(T))`.

### Thread Safety and Sharing (Current Subset)

`task` concurrency runs on OS threads. Crossing a task boundary is therefore a
thread-crossing operation.

In the current compiler subset:

- Passing values into a `task fn` is **by value**. For ownership-tracked values
  (for example `Drop` types and `Task(T)` / `Promise(T)` handles), this is a
  move: ownership transfers into the task and there is no implicit sharing.
- The checker enforces a conservative task-safety rule at `task fn` / `async task fn`
  boundaries (`E2037`):
  - non-opaque references (`&T`) are rejected (including nested inside structs and optionals),
  - references to opaque structs (types declared as `struct Name;`) are permitted
    (opaque structs cannot be dereferenced or field-accessed in Silk),
  - task boundary types are otherwise restricted to primitives, optionals, and
    structs/enums composed of task-safe members.
- Shared mutable state must be synchronized explicitly (for example via
  `std::sync` primitives or by communicating through channels).
- To share a runtime handle across tasks without transferring ownership, prefer
  stdlib APIs that follow the `T` / `TBorrow` pattern (for example
  `Channel(T)` + `ChannelBorrow(T)` and `AbortSignal` + `AbortSignalBorrow`).

Note: this includes `&Struct` values produced by `new`. The compiler-inserted
reference counting (RC) used for `new` is non-atomic in the current subset and
is not safe to share across OS threads.

These rules prevent common “accidentally share a borrowed view across threads”
bugs in the current subset. They do not prevent data races in programs that
explicitly share memory through FFI or other low-level mechanisms; such sharing
must be synchronized by the program.

### Important Limitations

- Hosted async runtime bring-up exists on the hosted `linux/x86_64` target:
  - `await` is a true suspension point backed by a single-threaded executor
    (fibers), so awaiting a pending `Promise(T)` can park and resume without
    blocking the OS thread.
  - The current implementation uses stackful coroutines in `libsilk_rt`
    (`src/silk_rt_async.c`) rather than a compiler state-machine coroutine
    transform. The long-term design remains a compiler transform + stable
    `std::runtime::event_loop` surface (see `docs/compiler/async-runtime.md`).
  - The shipped executor is **thread-affine**:
    - only the thread that created the executor may spawn and drive stackful
      coroutines (stackful coroutines are never migrated across OS threads),
    - `std::runtime::event_loop::{poll,deinit}` must be called on that same
      thread,
    - other OS threads (including `task fn` workers) may still call `async fn`
      entrypoints, but those calls run synchronously (no coroutine spawn), and
      `await` on a non-owner thread blocks the OS thread until the promise is
      resolved.
  - Awaiting a `Task(T)` is rejected by design; use `yield` / `yield *` for task values.
- The runtime subset implements `task` execution using OS threads:
  - By default, calling a `task fn` spawns a dedicated OS thread (via
    `pthread_create` on hosted POSIX targets).
  - When the callee is annotated with `attr(task=pool)` / `attr(task_pool)`,
    calls are scheduled on the global task pool (queue-based + simple work
    stealing between workers). The pool is created lazily.
- Full Send/Sync-style checking (beyond the conservative boundary restriction
  described above) is not implemented yet. In particular, the compiler does not
  attempt to prove absence of data races for shared state; programs must use
  explicit synchronization for any shared mutation.
- A small initial set of standard-library primitives exists now under
  `std::task` and `std::sync` for the hosted `linux/x86_64` subset. These are
  mostly blocking primitives today; integrating OS-facing std modules with the
  async executor/event loop is follow-up work.
- For cooperative cancellation across tasks and `async` functions, `std::`
  provides WHATWG-style abort signals via `std::abort_controller` (see
  `docs/std/abort-controller.md`).

## Core Keywords: `async` and `task`

### `async`

- Marks a function as **awaitable** (pausable).
- Primary domain (design): I/O-bound concurrency on an event loop/executor.

### `task`

- Marks a function as **task-safe** and eligible to be executed as a parallel
  task on a worker pool.
- Primary domain (design): CPU-bound parallelism and offloading blocking work.
- In the intended design, *calling a `task fn` is non-blocking* and produces a
  task handle.

### `await`

`await <expr>` is the surface syntax for unwrapping a `Promise(T)` handle.

In the current compiler subset:

- `await Promise(T)` unwraps the completed promise and yields `T`.
- `await Promise(Task(T))` yields `Task(T)` (which can then be consumed via `yield` / `yield *`).
- `await Task(T)` is rejected; use `yield` / `yield *` for task values.

#### Task/Promise Handle Ownership (Current Subset)

In the current compiler subset, `Task(T)` and `Promise(T)` are **single-use
handles**:

- A `Promise(T)` handle may be **awaited at most once**. `await` consumes the handle.
- A `Task(T)` handle may be **drained/joined at most once** via `yield *`
  (and `yield` on a temporary task expression drains as well, joining
  thread-per-call tasks).
- Handles are **non-copyable**: you may not copy a handle into another binding
  or use it as a normal value expression.
- A consumed handle may not be used again (including attempting to `await` it a
  second time, or attempting to `yield *` it a second time).
- Consuming a handle that was created outside the current loop body is rejected
  in the current subset (a loop may iterate multiple times).

These rules are enforced at compile time and exist to prevent double-free and
use-after-free bugs in the current runtime lowering, where `await` frees the
underlying handle storage after join/unwrap.

#### Handle Lifetime and Cleanup (Current Subset)

In the current compiler subset, `Task(T)` and `Promise(T)` handles are stored in
heap-allocated handle memory:

- `await` unwraps a promise and then frees the promise handle storage.
- `yield *` drains a task and then frees the task handle storage (joining
  thread-per-call tasks).
- If a handle is **not consumed** (`await`/`yield *`), the compiler inserts
  automatic cleanup when the handle binding is overwritten or goes out of scope:
  - `Task(T)` cleanup joins the worker thread (thread-per-call tasks) and then
    frees the handle storage. Pooled tasks (`attr(task=pool)`) skip the join
    since there is no per-call worker thread to join.
  - `Promise(T)` cleanup frees the handle storage.

Because tasks are implemented using OS threads in the current subset, this
automatic cleanup can block the current OS thread when it joins a task. Promise
cleanup uses the hosted async runtime’s destroy helper and may suspend the
current coroutine while waiting for a pending promise to resolve when running
under an executor.

### `yield`

`yield` is the task-side counterpart to `await`.

In the intended model for tasks:

- A `task fn ... -> T` produces a `Task(T)` handle when called.
- Inside the task body, `yield <expr>;` sends a value (convertible to `T`) to
  the task’s receiver and continues execution.
- `return <expr>;` sends the final task value (of type `T`) and terminates the
  task.
- Outside the task, `yield <task_handle>` blocks until the task produces its
  next value and yields it.
- `yield * <task_handle>` drains all remaining task values and then joins the
  worker thread for cleanup (thread-per-call tasks). Pooled tasks
  (`attr(task=pool)`) skip the join. In value position, `yield *` yields a
  collected `T[]`.
- `yield * <task_handle>;` as a statement forwards all remaining values from the
  right-hand task to the enclosing task’s receiver and then joins/cleans up the
  drained task.

In the current compiler subset:

- `yield` is a blocking OS-thread operation (like the rest of the current
  concurrency runtime).
- `yield` is permitted only inside `task fn` / `async task fn` bodies and inside
  `task { ... }` / `task loop { ... }` blocks.
- The statement forms (`yield <value>;` and `yield * <task_handle>;` forwarding)
  require an enclosing task function (`task fn` / `async task fn`), since they
  send values to the task’s receiver.

#### Collected Array Ownership (Current Subset)

In the current subset, `yield *` and `await *` produce a heap-allocated
collection of values (`T[]`) for convenience. This is a current behavior:

- the compiler inserts deterministic cleanup for these collections when their
  bindings are overwritten or go out of scope,
- the returned `T[]` value must not be copied, and must not escape its defining
  scope until a stable owning collection type is specified.

### Structured Concurrency Blocks and Loops

`async { ... }`, `task { ... }`, `async loop { ... }`, and `task loop { ... }`
introduce structured regions intended for scheduler-backed concurrency and
ensure all work started in the region completes before exit.

In the current compiler subset, these forms parse and type-check, but they do
not yet introduce any runtime scheduling; they currently behave like a normal
lexical block.

## Future Work: Runtime and Safety

Silk’s concurrency model intentionally separates:

- **I/O-bound concurrency** (`async`, driven by an executor/event loop), from
- **CPU-bound parallelism** (`task`, executed on OS threads).

Long-term work focuses on making this split ergonomic, predictable, and safe.

Planned work:

- Stabilize `Task(T)` / `Promise(T)` ownership and ergonomics:
  - move-only handles that can be stored in structs and collections,
  - stable join/drain APIs (and cancellation where applicable).
- Specify and implement typed-error contract behavior across `async`/`await`
  (including how `?` propagation composes with `await`).
- Lower `task fn` calls to a scheduler-backed pool by default (instead of
  spawning a dedicated OS thread per call), with explicit controls for worker
  counts and backpressure.
- Integrate `yield` / `yield *` with the async executor when used inside `async`
  code so waiting on task output can suspend the current async function instead
  of blocking the OS thread.
- Make structured blocks (`async { ... }` / `task { ... }`) runtime-backed
  scopes with well-delimited lifetimes (spawn/join and cancellation on early
  exit), composed with `std::abort_controller`.
- Replace the current conservative “no `&T` across task boundaries” rule with a
  more expressive Send/Sync-style system for cross-task values and shared
  handles.

Non-goals / design constraints:

- `async` is cooperative: there is no preemptive async scheduling.
- `await Task(T)` remains rejected; task values are consumed via `yield` /
  `yield *`.
- Hosted async coroutines are not migrated across OS threads; parallelism is
  expressed via `task` and explicit synchronization.
