# Concurrency

Concurrency in Silk is built around two orthogonal function modifiers:

- `async` — marks a function as pausable/awaitable (concurrency),
- `task` — marks a function as safe to execute on a worker pool (parallelism),

plus structured concurrency blocks (`async { ... }` and `task { ... }`)
intended to provide **structured concurrency**.

- The runtime can manage a thread pool to execute tasks.
- The compiler is intended to enforce task-safety rules when values cross task
 boundaries (Send/Sync-like constraints).

## Notes

This document describes the **language design** for concurrency and the subset
implemented by the compiler/runtime today.

### Notes

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
 - **receive** (`yield <task_handle>`) in value position: waits until the task
 produces its next value and yields `T`.
 - under the hosted async executor, this wait suspends the current coroutine
 instead of blocking the executor owner OS thread,
 - outside an executor (or on non-owner threads), it blocks the current OS
 thread until the task produces a value.
- `yield` on a temporary task handle is eager in the Supported forms:
 - `yield <task_expr>` where `<task_expr>` is not a named handle drains the
 task (joining dedicated-thread tasks only) and yields its final value `T`
 (so the temporary handle does not leak).
- `yield * <task_handle>` in value position drains a task:
 - `yield * Task(T)` receives **all** remaining values from the task, joins
 the dedicated worker thread when the task uses `attr(task=thread)`, and
 yields a collected `T[]` result (with the task’s final return value as the
 last element). Pooled/default tasks skip the join.
 - `yield *` also accepts fixed task arrays and returns one concatenated
 collected `T[]` in source order, including:
 - named bindings such as `yield * tasks`,
 - direct fixed-array expressions,
 - struct-field carriers such as `yield * box.tasks`,
 - nested field expressions such as `yield * make_box().tasks`.
- `yield * <task_handle>;` as a statement inside a task function forwards values:
 - drains the right-hand task and forwards all remaining values to the
 enclosing task’s receiver, then joins/cleans up the drained task.
 - the same forwarding sugar accepts fixed task arrays and drains them in
 source order, including field-carried fixed arrays.
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
- Conservative suspension-safety rules are enforced at `async fn` boundaries:
 - `async fn` result types must not contain ordinary borrowed views (`&T` or
 `T[]`), including when nested inside structs, enums, optionals, or
 function types,
 - references to opaque structs (`struct Name;`) remain permitted in async
 results because they are treated as external handles rather than
 borrow-checked views into Silk storage,
 - borrowed async parameters are permitted, but an ordinary borrow of
 function-local stack storage or a local fixed array may not be passed into
 an async call unless that call is awaited immediately in the same
 expression.
- Conservative suspension-safety rules are also enforced at concrete `await`
 points:
 - `await` / `await *` reject a live borrowed reference that still points at
 a local stack value,
 - `await` / `await *` reject a live slice that still points at a local fixed
 array,
 - and the same rule applies when the borrowed view is stored in a local
 struct field.
- `async { ... }` / `task { ... }` are accepted as structured concurrency surface
 forms and establish lexical scopes with deterministic runtime-backed cleanup:
 - live `Promise(T)` bindings are awaited/destroyed on scope exit,
 - live `Task(T)` bindings are drained/destroyed on scope exit,
 - and the same cleanup runs for lowered early-exit paths such as `return`.
 - these blocks do not create nested executors or inject implicit cancellation
 tokens in the Supported forms.
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

### Thread Safety and Sharing

`task` concurrency runs on OS threads. Crossing a task boundary is therefore a
thread-crossing operation.

In Silk currently:

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
reference counting (RC) used for `new` is non-atomic in the Supported forms and
is not safe to share across OS threads.

These rules prevent common “accidentally share a borrowed view across threads”
bugs in the Supported forms. They do not prevent data races in programs that
explicitly share memory through FFI or other low-level mechanisms; such sharing
must be synchronized by the program.

### Considerations

- Hosted async runtime bring-up exists on supported hosted POSIX targets
 (`linux/*` and Apple Silicon `macos/aarch64` today):
 - `await` is a true suspension point backed by a single-threaded executor
 (fibers), so awaiting a pending `Promise(T)` can park and resume without
 blocking the OS thread.
 - The current implementation uses stackful coroutines in `libsilk_rt`
 (`src/silk_rt_async.c`) rather than a compiler state-machine coroutine
 transform. The long-term design remains a compiler transform + stable
 `std::runtime::event_loop` surface (see [async runtime](?p=compiler/async-runtime)).
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
 - Executable entrypoints currently support `fn main (...) -> int`,
 `async fn main (...) -> int`, and `fn main(argc: int, argv: u64) -> int`.
 Task-backed entrypoints such as `task fn main` and `async task fn main`
 are rejected by the executable runtime path; keep task work inside an
 ordinary or async `main`.
- The runtime subset implements `task` execution using OS threads:
 - By default, calling a `task fn` schedules that task on the global task
 pool (a shared queue-based worker pool). The pool is created lazily.
 - `attr(task=thread)` forces a dedicated OS thread per call.
 - The pool worker count is configurable via `SILK_TASK_POOL_THREADS`.
 - The queued backlog is configurable via `SILK_TASK_POOL_MAX_QUEUED`.
- Full Send/Sync-style checking (beyond the conservative boundary restriction
 described above) is not implemented yet. In particular, the compiler does not
 attempt to prove absence of data races for shared state; programs must use
 explicit synchronization for any shared mutation.
- A small initial set of standard-library primitives exists now under
 `std::task` and `std::sync` for supported hosted POSIX targets. Some
 OS-facing std modules already integrate with the async executor/event loop
 for timers, fd readiness, I/O, and TCP connect/accept; wider cancellation and
 platform parity remains follow-up work.
- For cooperative cancellation across tasks and `async` functions, `std::`
 provides WHATWG-style abort signals via `std::abort_controller` (see
 [abort controller](?p=std/abort-controller)).

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

In Silk currently:

- `await Promise(T)` unwraps the completed promise and yields `T`.
- `await Promise(Task(T))` yields `Task(T)` (which can then be consumed via `yield` / `yield *`).
- `await Task(T)` is rejected; use `yield` / `yield *` for task values.
- `await` / `await *` also reject live borrows of ordinary local stack or
 fixed-array storage at the suspension point; end such borrows before
 awaiting.
- Ordinary non-entrypoint `async fn` bodies support `await * Promise(T)[]`
 fan-in, including named fixed-array locals such as:
 - `let promises = [reader(), writer()];`
 - `await * promises;`
 The compiler/runtime path drains those promise handles and treats the bound
 fixed array as consumed so scope cleanup does not attempt to drop the same
 handles twice.

#### Typed Errors Across Async Calls

Typed-error handling composes with async calls in the Supported forms, but the
fallible operation remains the **async call site** rather than the `await`
itself.

For an async function like:

```silk
error OpenFailed {
  code: int,
}

async fn open_value () -> int | OpenFailed {
  return 1;
}
```

the current checker behavior is:

- `await open_value()` is rejected with `E2023` because the fallible async call
 has not been handled yet.
- `let p: Promise(int) = open_value()?;` is accepted inside a matching error
 contract.
- `let v: int = await open_value()?;` is accepted and is the supported
 propagation form in the Supported forms.
- Explicit handling with `match` applies to the async call itself, so the
 success arm receives the `Promise(T)` handle:

```silk
match (open_value()) {
  p => {
    let v: int = await p;
    return v;
  },
  err: OpenFailed => {
    panic OpenFailed { code: err.code };
  }
}
```

#### Task/Promise Handle Ownership

In Silk currently, `Task(T)` and `Promise(T)` are **single-use
handles**:

- A `Promise(T)` handle may be **awaited at most once**. `await` consumes the handle.
- A `Task(T)` handle may be **drained/joined at most once** via `yield *`
 (and `yield` on a temporary task expression drains as well, joining
 thread-per-call tasks).
- Handles are **non-copyable**: you may not copy a handle into another binding
 or use it as a normal value expression.
- Discard bindings may not consume handles:
 - `let _ = task_call();` is rejected for `Task(T)`,
 - `let _ = async_call();` is rejected for `Promise(T)`,
 because `_` performs end-of-statement cleanup rather than structured
 scope-exit cleanup.
- Handles may be moved into ordinary bindings, reassigned after consumption,
 passed through consuming call positions, and moved into collections that
 accept move-only element values.
- Direct `Task(T)` / `Promise(T)` storage in struct and error fields is part of
 the Supported forms:
 - `struct Box { t: Task(int) }` is accepted,
 - `struct Box { p: Promise(int) }` is accepted,
 - consuming field access such as `yield * box.t` and `await box.p` is
 tracked with the same single-use rule as local handle bindings,
 - whole-value initialization/copy/reassignment refreshes the stored field
 handle state for the destination aggregate.
- A consumed handle may not be used again (including attempting to `await` it a
 second time, or attempting to `yield *` it a second time).
- Consuming a handle that was created outside the current loop body is rejected
 in the Supported forms (a loop may iterate multiple times).

These rules are enforced at compile time and exist to prevent double-free and
use-after-free bugs in the current runtime lowering, where `await` frees the
underlying handle storage after join/unwrap.

#### Handle Lifetime and Cleanup

In Silk currently, `Task(T)` and `Promise(T)` handles are stored in
heap-allocated handle memory:

- `await` unwraps a promise and then frees the promise handle storage.
- `yield *` drains a task and then frees the task handle storage (joining
 dedicated-thread tasks).
- `yield *` over a fixed task array consumes each contained handle exactly once
 and marks the named array binding moved so cleanup does not attempt to free
 the same handles again.
- If a handle is **not consumed** (`await`/`yield *`), the compiler inserts
 automatic cleanup when the handle binding is overwritten or goes out of scope:
 - `Task(T)` cleanup joins the worker thread for `attr(task=thread)` tasks and
 then frees the handle storage. Pooled/default tasks skip the join since
 there is no per-call worker thread to join.
 - `Promise(T)` cleanup frees the handle storage.

Because tasks are implemented using OS threads in the Supported forms, this
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
- The receive form is a value-position expression, not a statement form:
 - `let value = yield task_handle;` receives one value,
 - `yield task_handle;` is parsed as the statement/send form and is therefore
 not the right way to wait on another task handle.
- `yield * <task_handle>` drains all remaining task values and then joins the
 worker thread for cleanup when the task uses `attr(task=thread)`.
 Pooled/default tasks skip the join. In value position, `yield *` yields a
 collected `T[]`.
- `yield * <task_handle>;` as a statement forwards all remaining values from the
 right-hand task to the enclosing task’s receiver and then joins/cleans up the
 drained task.

In Silk currently:

- `yield` is a blocking OS-thread operation (like the rest of the current
 concurrency runtime).
- `yield` is permitted only inside `task fn` / `async task fn` bodies and inside
 `task { ... }` / `task loop { ... }` blocks.
- The statement forms (`yield <value>;` and `yield * <task_handle>;` forwarding)
 require an enclosing task function (`task fn` / `async task fn`), since they
 send values to the task’s receiver.

#### Collected Array Ownership

In the Supported forms, `yield *` and `await *` produce a heap-allocated
collection of values (`T[]`) for convenience. This is a current behavior:

- the compiler inserts deterministic cleanup for these collections when their
 bindings are overwritten or go out of scope,
- the returned `T[]` value must not be copied, and must not escape its defining
 scope until a stable owning collection type is specified.

### Structured Concurrency Blocks and Loops

`async { ... }`, `task { ... }`, `async loop { ... }`, and `task loop { ... }`
introduce surface syntax for structured regions.

In Silk currently, these forms remain lexical scopes, but they are
runtime-backed for live-handle cleanup:

- live `Promise(T)` bindings are awaited/destroyed on scope exit,
- live `Task(T)` bindings are drained/destroyed on scope exit,
- task waits performed during that cleanup use the hosted async fd-wait path
 when running under the executor, so cleanup inside async code suspends the
 current coroutine rather than blocking the executor owner thread,
- and no implicit nested scheduler or abort-controller injection occurs.

## Current Runtime Boundaries

This language document describes the shipped concurrency subset and its current
boundaries. Longer-term runtime architecture notes are tracked in
[async runtime](?p=compiler/async-runtime); the runtime backlog items for the current
hosted subset are now implemented.

Current boundaries and non-goals:

- `async` is cooperative: there is no preemptive async scheduling.
- `task fn` calls default to the global task pool; `attr(task=thread)` is the
 explicit dedicated-thread opt-out.
- `yield` / `yield *` waits inside executor-driven async code suspend the
 current coroutine, but the same operations still block when no executor is
 active or when run from non-owner threads.
- structured blocks/loops guarantee deterministic live-handle cleanup on scope
 exit and early exit, but they do not inject implicit cancellation tokens or
 nested executors.
- Task-boundary safety still uses the conservative current rule that rejects
 ordinary non-opaque `&T` across `task fn` / `async task fn` boundaries.
- `await Task(T)` remains rejected; task values are consumed via `yield` /
 `yield *`.
- Hosted async coroutines are not migrated across OS threads; parallelism is
 expressed via `task` and explicit synchronization.
