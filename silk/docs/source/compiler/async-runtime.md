# Async Runtime (Hosted)

Status: **Bring-up implementation (linux/x86_64 hosted)**.

This document now serves two roles:

- Describe the **current shipped hosted async runtime** used by the compiler today.
- Specify the longer-term architecture (compiler coroutine transform + richer event loop)
  that the current implementation is expected to evolve toward.

The current hosted async runtime is implemented in C in `src/silk_rt_async.c` and wired
into lowering in `src/lower_ir.zig`. It provides:

- stackful coroutines (fibers) using `ucontext`,
- a single-threaded executor/event loop that can drive `async fn main () -> int`,
- `await` as a true suspension point (parks the current fiber instead of blocking the OS thread),
- basic async timers and fd readiness wait,
- opportunistic Linux `io_uring` usage for timeouts and fd polling when available.

Structured concurrency blocks (`async { ... }` / `task { ... }`) are still lexical-only today;
they do not yet have cancellation/join semantics enforced by a runtime-backed scope.

See also:

- language model and current subset: `docs/language/concurrency.md`
- function disciplines: `docs/language/function-disciplines.md`
- runtime layering: `docs/std/runtime.md`
- current blocking hosted utilities: `docs/std/task.md`, `docs/std/io.md`, `docs/std/networking.md`

## Current Implementation (Shipped)

### Promise handle layout (ABI for runtime lowering)

In the current implementation, `Promise(T)` values are lowered as a single `u64` handle
that points at heap-allocated handle storage with this layout:

- `[0] u64 kind`
- `[8] u64 impl_ptr`
- `[16..]` payload scalars (8 bytes each) for the result slots of `T`,
  followed by the argument scalars captured for the spawned async entry.

When a promise is pending, `impl_ptr` is non-zero and points at runtime-owned state
(a coroutine/future). When resolved, `impl_ptr` is zero and the payload contains the result.

### Runtime entrypoints (current)

The compiler lowering currently uses these runtime functions (all bundled into the
runtime C objects linked into hosted outputs):

- `silk_rt_async_spawn(entry_ptr: u64, promise_handle: u64) -> i32`
  - schedules a coroutine when an executor is active, otherwise runs it synchronously and
    resolves the promise immediately.
- `silk_rt_async_await(promise_handle: u64) -> void`
  - if the promise is pending, parks the current coroutine and yields to the executor.
- `silk_rt_async_destroy(promise_handle: u64) -> void`
  - destroys a promise handle; if it is still pending, it awaits it first.
- `silk_rt_async_block_on_main0/2(entry_ptr: u64, [argc: i64, argv: u64]) -> i64`
  - creates an executor/event loop, spawns the async `main` promise, and drives it to completion.

The runtime also exposes low-level awaitable building blocks:

- `silk_rt_async_sleep_ms(ms: i64) -> u64`
- `silk_rt_async_fd_wait_readable(fd: i64) -> u64`
- `silk_rt_async_fd_wait_writable(fd: i64) -> u64`

These are intended to be wrapped by stable `std::runtime::event_loop` / `std::task` /
`std::io` surfaces as that layer is brought up. In the current stdlib snapshot,
timers and fd readiness are exposed via `std::runtime::event_loop`, and sleep
helpers are wrapped as `std::task::{sleep_ms_async,sleep_async}`.

### Executor/event loop (current)

The current executor is single-threaded and cooperative:

- runnable coroutines are queued and resumed one at a time,
- timers are managed with a deadline min-heap,
- fd readiness is managed via `poll(2)` watchers,
- cross-thread wake uses `eventfd`.

On Linux, the runtime attempts to initialize an `io_uring` instance. When available, it
uses:

- `IORING_OP_TIMEOUT` for timers, and
- `IORING_OP_POLL_ADD` for fd readiness wait,

falling back to `poll(2)` when `io_uring` is unavailable.

Limitations (current):

- The stable `std::runtime::event_loop` surface is still incomplete:
  - `sleep_ms` and `fd_wait_{readable,writable}` are implemented and wired to the hosted runtime,
  - but the explicit `Handle`/`init`/`poll` API is still a stub placeholder.
- No structured-concurrency scope semantics yet (cancellation/joining on early exit).
- No completion-based `io_uring` I/O ops yet (read/write/accept/connect still use blocking paths).

## Goals

- Make `await` a **non-blocking suspension point** in hosted builds:
  - awaiting a pending operation suspends the current async function and returns control to
    the executor,
  - the executor resumes it when the awaited operation completes.
- Provide a high-performance hosted I/O backend:
  - use **Linux `io_uring`** for completion-based I/O where available,
  - provide a **portable POSIX fallback** (readiness-based) for non-Linux hosted targets.
- Keep the runtime **pluggable** via the `std::runtime::...` layering:
  - higher-level `std::...` modules should rely on stable `std::runtime::...` interfaces,
  - alternative stdlib roots may provide alternate runtime backends.
- Preserve **structured concurrency** as the default model:
  - `async { ... }` / `task { ... }` scopes must ensure spawned work completes (or is cancelled)
    before the scope exits.

## Non-Goals (Initial Phases)

- Preemptive scheduling of async functions (async is cooperative).
- A fully general “async everywhere” rewrite of the standard library in one step.
- Cross-platform parity for advanced kernel features (Linux-first for the initial hosted backend).

## Terminology

- **Coroutine lowering / transform**: compiler rewriting of `async fn` bodies into explicit
  state machines that can be paused and resumed.
- **Executor / event loop**: runtime component that drives async state machines and I/O
  completion events.
- **Promise(T)**: the surface handle returned by calling an `async fn` (already present in the
  language model). In the full design it becomes a handle to a suspended/resumable coroutine
  or an in-flight I/O operation.
- **Waker**: an opaque handle used by awaited operations to request that a suspended coroutine
  be resumed by the executor.

## High-Level Model

### `async fn` lowering

Conceptually, each `async fn` lowers to:

- a heap-allocated **frame** that stores:
  - the current resume state (a small integer state id),
  - live locals that must survive across suspension points,
  - bookkeeping for completion (result storage, completion flag, waker link).
- a `resume(frame, waker) -> Poll(T)` function:
  - `Poll::Ready(value)` when complete,
  - `Poll::Pending` when it must suspend (because it has awaited a pending operation).

The compiler is responsible for:

- identifying suspension points (`await`, and any future syntactic sugar that implies awaiting),
- computing which locals must be stored in the frame across each suspension point,
- preserving typed-error and `panic` semantics during the transform.

Note: the current shipped bring-up does **not** yet implement this state-machine transform.
Instead, `async fn` bodies execute on stackful coroutines provided by the runtime (`ucontext`)
and suspension points yield back to the executor by swapping contexts. The long-term plan is
to migrate from stackful coroutines to an explicit compiler transform once the async surface
stabilizes.

### `await` behavior

`await <expr>` becomes:

1. poll the awaited `Promise(T)` once,
2. if `Ready(v)`, continue with `v`,
3. if `Pending`, store enough state to resume later and return `Pending` to the caller.

The key requirement is that `await` must not block an OS thread in hosted builds.

### `async fn main`

The CLI already permits `async fn main () -> int` as an executable entrypoint
(`docs/compiler/cli-silk.md`). With a real executor, the entry stub for executables will:

- create a default executor/event loop,
- create the `Promise(int)` for `main`,
- drive it to completion,
- then exit with the returned integer.

## Structured Concurrency and Cancellation

Structured concurrency forms (`async { ... }`, `task { ... }`, and their `loop` variants)
become **runtime-backed scopes** rather than lexical-only blocks.

Initial requirements:

- A structured scope tracks spawned child operations (async children and task children).
- Exiting the scope normally requires joining/draining all children.
- Exiting early (typed error propagation, `panic`, `break`, `return`) triggers cancellation
  of children, followed by joining/draining them before control leaves the scope.

Cancellation semantics must be explicit in the runtime and observable in `std::...` APIs
(for example, async socket reads should become cancellable).

## Runtime Layering (`std::runtime`)

The async executor and event loop will be exposed under `std::runtime` as a new runtime area.

### Proposed new runtime area

- `std::runtime::event_loop` — stable interface used by the compiler-generated coroutine
  runtime and by async-aware stdlib code.
- Backends:
  - `std::runtime::linux::event_loop` — Linux `io_uring` implementation (preferred).
  - `std::runtime::posix::event_loop` — portable readiness-based fallback (poll/epoll).
  - `std::runtime::wasi::event_loop` — WASI implementation (likely limited; may be timers +
    host-provided polling when available).

The interface must support:

- timer scheduling (sleep/until deadlines),
- a way to submit I/O operations and receive completions,
- a way to wake the executor from other threads (task pool → event loop),
- a polling primitive used by the executor’s main loop.

The exact Silk-level signatures are specified in `std/runtime/event_loop.slk` and are expected
to evolve during bring-up, but the long-term contract should avoid exposing raw platform
struct layouts directly to user code.

## Linux Backend: `io_uring`

### Why `io_uring`

Linux `io_uring` provides completion-based I/O with low syscall overhead, and supports a wide
range of operations (reads/writes, accept/connect, timeouts, polling, file ops).

Using `io_uring` allows:

- fewer threads for large numbers of concurrent I/O operations,
- a unified completion queue that naturally integrates with `await`,
- efficient cancellation and timeouts via linked SQEs and cancellation ops.

### Integration shape

The `io_uring` backend will:

- own the ring (SQ/CQ memory mappings),
- assign a stable `user_data` id per submitted operation,
- translate CQE completions into coroutine wakeups.

Important implementation notes for later phases:

- provide an internal submission queue abstraction that batches SQEs,
- use `eventfd` (or `IORING_SETUP_SQPOLL` where appropriate) for cross-thread wakeups,
- support operation timeouts and cancellation without leaking resources,
- consider optional performance features only after correctness:
  - fixed-file registration,
  - buffer registration / buffer rings,
  - multishot accept/recv where supported.

## Fallback Backend: readiness-based POSIX loop

For non-Linux hosted targets (or when `io_uring` is unavailable), the fallback backend will:

- use `poll`/`epoll` (and eventually `kqueue` on BSD/macOS) to wait for readiness,
- resume suspended coroutines when their fds become ready,
- use a timer heap/wheel for timeouts and sleeps.

This backend is expected to have higher per-op overhead than `io_uring` but must preserve the
same language-level semantics.

## Testing and Performance Guardrails

Bringing up the async runtime requires:

- end-to-end correctness tests:
  - `async fn main` driving timers and I/O,
  - cancellation behavior in structured scopes,
  - concurrency + typed errors interaction (`-> T | Error...` + `await` + propagation).
- performance regression guardrails:
  - microbench-style fixtures that exercise “many concurrent sockets/timers” scenarios,
  - optional hosted assembly/codegen comparisons (separate from correctness) to detect obvious
    regressions in the `async` lowering and runtime calls.

Performance tests must be designed so that they do not rely on unstable wall-clock timing in
CI; prefer structural checks (operation counts, allocations, syscalls) where feasible.

## Phased Bring-Up Plan (Summary)

1. **Coroutine transform (no I/O)**:
   - implement state machine lowering for `async fn` with `await` suspension,
   - implement a minimal single-threaded executor that can drive `async fn main`,
   - implement async timers (`sleep_ms`, `sleep_until`) on the event loop.
2. **Portable I/O readiness backend**:
   - expose async fd readiness in `std::runtime::event_loop`,
   - add async wrappers in `std::io` / `std::net` (opt-in, minimal initial surface).
3. **Linux `io_uring` backend**:
   - implement submission/completion for core ops (read/write/accept/connect/timeout),
   - wire completions to coroutine wakeups,
   - add `io_uring`-specific tests and stress fixtures.
4. **Structured concurrency semantics**:
   - implement `async { ... }` / `task { ... }` as real scopes with cancellation/joining,
   - ensure scope behavior is enforced consistently in the checker + runtime.
