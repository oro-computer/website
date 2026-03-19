# Async Runtime (Hosted)

Status: **Implemented hosted subset + architecture notes (`linux/x86_64`)**.

This document now serves two roles:

- Describe the **current shipped hosted async runtime** used by the compiler today.
- Specify the longer-term architecture (compiler coroutine transform + richer event loop)
  that the current implementation is expected to evolve toward.

The current hosted async runtime is implemented in C in `src/silk_rt_async.c` and wired
into lowering in `src/lower_ir.zig`. It provides:

- stackful coroutines (fibers) using `ucontext`,
- a single-threaded executor/event loop that can drive `async fn main () -> int`,
- `await` as a true suspension point (parks the current fiber instead of blocking the OS thread),
- basic async timers, fd readiness wait, and async `read`/`write`,
- task-pipe waits used by `yield` / `yield *` and task-handle cleanup routed
  through async fd readiness when running under the executor,
- opportunistic Linux `io_uring` usage for timeouts, fd polling, and completion-based I/O when available.

Structured concurrency blocks (`async { ... }` / `task { ... }`) now establish
lexical scopes with runtime-backed cleanup for live `Task(T)` / `Promise(T)`
bindings on normal exit and early exit. They do not yet inject implicit
cancellation tokens or nested executors.

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
  - schedules a coroutine when an executor is active on the current OS thread (the
    executor owner thread); otherwise runs it synchronously on the calling thread and
    resolves the promise immediately.
- `silk_rt_async_await(promise_handle: u64) -> void`
  - if the promise is pending:
    - on the executor owner thread: parks the current coroutine (when inside a coroutine)
      or drives the executor until completion (when called from non-coroutine code),
    - on other OS threads: blocks the OS thread until the promise is resolved.
- `silk_rt_async_destroy(promise_handle: u64) -> void`
  - destroys a promise handle; if it is still pending, it awaits it first.
- `silk_rt_async_block_on_main0/2(entry_ptr: u64, [argc: i64, argv: u64]) -> i64`
  - creates an executor/event loop, spawns the async `main` promise, and drives it to completion.

The runtime also exposes an explicit executor/event-loop surface (used by
`std::runtime::event_loop`):

- `silk_rt_async_event_loop_init() -> u64`
  - creates a single global executor/event loop instance and returns its handle,
    or returns `0` when initialization fails or an executor is already active.
- `silk_rt_async_event_loop_deinit(handle: u64) -> void`
  - shuts down the global executor/event loop instance.
- `silk_rt_async_event_loop_wake(handle: u64) -> i64`
  - wakes a blocked poll (for example from another OS thread); returns `0` on
    success, otherwise a positive error code.
- `silk_rt_async_event_loop_poll(handle: u64, timeout_ms: i64) -> i64`
  - polls the executor/event loop for up to `timeout_ms` milliseconds and
    returns a backend-defined progress count, or returns `-<code>` on failure.

The runtime also exposes low-level awaitable building blocks:

- `silk_rt_async_sleep_ms(ms: i64) -> u64`
- `silk_rt_async_fd_wait_readable(fd: i64) -> u64`
- `silk_rt_async_fd_wait_readable2(fd0: i64, fd1: i64) -> u64`
- `silk_rt_async_fd_wait_readable_any(fds_ptr: u64, fds_len: i64) -> u64`
- `silk_rt_async_fd_wait_writable(fd: i64) -> u64`
- `silk_rt_async_io_read(fd: i64, buf: u64, len: i64) -> u64`
- `silk_rt_async_io_write(fd: i64, buf: u64, len: i64) -> u64`
- `silk_rt_async_net_accept(fd: i64) -> u64`
- `silk_rt_async_net_connect_ipv4(fd: i64, a: i64, b: i64, c: i64, d: i64, port: u16) -> u64`
- `silk_rt_async_net_connect_ipv6(fd: i64, addr_hi: u64, addr_lo: u64, port: u16, scope_id: i64) -> u64`

These are intended to be wrapped by stable `std::runtime::event_loop` / `std::task` /
`std::io` surfaces as that layer continues to expand. In the current stdlib snapshot,
timers and fd readiness are exposed via `std::runtime::event_loop`, and sleep
helpers are wrapped as `std::task::{sleep_ms_async,sleep_async}`. As of the
current hosted runtime snapshot, `silk_rt_async_io_{read,write}` return
`Promise(i64)` handles (lowered as a `u64` promise handle) whose payload is the operation result:
- `>= 0` is the byte count,
- `< 0` is `-errno` (for example `-EINTR`).

The socket helpers follow the same convention:

- `silk_rt_async_net_accept` payload:
  - `>= 0` is the accepted connection fd,
  - `< 0` is `-errno`.
- `silk_rt_async_net_connect_*` payload:
  - `0` is success,
  - `< 0` is `-errno`.

For `silk_rt_async_fd_wait_readable2`, the promise payload is:

- `0` when `fd0` becomes readable,
- `1` when `fd1` becomes readable,
- `< 0` as `-errno` when the wait fails.

For `silk_rt_async_fd_wait_readable_any`, the promise payload is:

- `0..fds_len-1` (the index of the fd that became readable),
- `< 0` as `-errno` when the wait fails.

`fds_ptr` must point to `i64[fds_len]` values (each element is a file descriptor).

### Executor/event loop (current)

The current executor is single-threaded and cooperative:

- runnable coroutines are queued and resumed one at a time,
- timers are managed with a deadline min-heap,
- fd readiness is managed via `poll(2)` watchers,
- cross-thread wake uses `eventfd`.
  - the executor is thread-affine: only the thread that created the executor may drive it.

Note on signal masks:

- `ucontext` saves/restores the thread signal mask as part of the context.
- The runtime syncs coroutine and executor contexts to the current thread mask before
  swapping contexts, so `await`/executor polling does not restore a stale mask.
  This is required for thread-level signal masking patterns like `std::signal`
  (`signalfd(2)` on Linux).

On Linux, the runtime attempts to initialize an `io_uring` instance. When available, it
uses:

- `IORING_OP_TIMEOUT` for timers, and
- `IORING_OP_POLL_ADD` for fd readiness wait,

falling back to `poll(2)` when `io_uring` is unavailable.

Limitations (current):

- The `std::runtime::event_loop` handle surface is still limited:
  - only one global executor/event loop instance may be active at a time,
  - `std::runtime::event_loop::init()` fails when an executor is already active
    (for example inside `async fn main`).
- Structured blocks do not yet inject implicit cancellation into arbitrary
  child operations; current scope semantics are deterministic live-handle
  cleanup, not a general child-registry cancellation system.
- Completion-based I/O is implemented for `read`/`write`/`accept`/`connect` when `io_uring` is available.
  - Explicit completion cancellation is not yet exposed as part of the shipped
    std/runtime surface.

## Current Hosted Runtime Status

The runtime-backlog items for the current hosted concurrency subset are now
implemented:

- plain `task fn` / `async task fn` calls now default to the global task pool,
  with `attr(task=thread)` as the explicit dedicated-thread opt-out,
- the global task pool now supports explicit queued-work backpressure via
  `SILK_TASK_POOL_MAX_QUEUED` in addition to `SILK_TASK_POOL_THREADS`,
- task reads/drains used by `yield` / `yield *` and task-handle cleanup now
  route through async fd waits when an executor is active, so these waits
  suspend the current coroutine instead of blocking the executor owner thread,
- and structured blocks/loops now provide deterministic runtime-backed cleanup
  of live `Task(T)` / `Promise(T)` bindings on normal exit and early exit.

Remaining future work in this file is longer-term architecture evolution for
the hosted runtime, not backlog for the shipped subset. Task-boundary safety
model expansion is tracked in the language/checker docs rather than here.

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

Note: the current shipped hosted runtime does **not** yet use this explicit
state-machine transform.
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
(`docs/compiler/cli-silk.md`). In the shipped hosted runtime, the entry stub for executables:

- create a default executor/event loop,
- create the `Promise(int)` for `main`,
- drive it to completion,
- then exit with the returned integer.

## Structured Concurrency and Cancellation

Structured concurrency forms (`async { ... }`, `task { ... }`, and their `loop`
variants) are now **runtime-backed lexical scopes** for live-handle cleanup.

Current shipped guarantees:

- live `Promise(T)` bindings are awaited/destroyed on scope exit,
- live `Task(T)` bindings are drained/destroyed on scope exit (joining
  dedicated-thread tasks; pooled/default tasks skip the join),
- the same cleanup runs on overwrite and on early control-flow exits after
  lowering rewrites the scope exit path,
- and when that cleanup waits on task output under the hosted executor, the
  current coroutine is suspended instead of blocking the executor owner thread.

Current non-goals:

- no implicit nested executor creation,
- no automatic `std::abort_controller` injection,
- and no general cancellation registry for arbitrary child operations beyond
  the explicit handles that are currently live in scope.

## Runtime Layering (`std::runtime`)

The async executor and event loop are exposed under `std::runtime` as the
`std::runtime::event_loop` runtime area.

### Current runtime area

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
to continue evolving, but the long-term contract should avoid exposing raw platform
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

## Longer-Term Architecture Evolution (Summary)

The major hosted runtime milestones are now shipped:

1. **Hosted coroutine executor**:
   - stackful coroutine execution for `async fn`,
   - executor-backed `async fn main`,
   - runtime timers and fd readiness waits.
2. **Runtime/std integration**:
   - `std::runtime::event_loop` handle + poll surface,
   - async wrappers in `std::task`, `std::io`, and `std::net`,
   - optional Linux `io_uring` acceleration with readiness fallbacks.

The remaining architecture work is about refinement and expansion:

3. **Compiler-managed coroutine frames**:
   - migrate from stackful coroutines to an explicit compiler transform once
     the async surface stabilizes.
4. **Broader async coverage and cancellation semantics**:
   - widen completion-backed operations,
   - extend the current live-handle cleanup model to richer explicit
     cancellation-aware child registries only when the language/std surface
     genuinely needs them,
   - keep cancellation behavior aligned across the checker, lowering, runtime,
     and `std::...` APIs.
