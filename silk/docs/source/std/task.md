# `std::task`

This module provides a small hosted baseline for
task/runtime utilities on `linux/x86_64`.

This is **not** the full structured-concurrency design, but the hosted
`linux/x86_64` toolchain now ships a bring-up async executor (fibers) used to
make `await` a true suspension point. In the Supported forms:

- `task fn` calls default to the global task pool; `attr(task=thread)` opts a
 task back into a dedicated OS thread per call.
- `yield` / `yield *` remain language operators rather than stdlib functions,
 but waiting on task output from executor-driven async code now suspends the
 current coroutine instead of blocking the executor owner OS thread.
- Sleep helpers are split into:
 - blocking thread sleeps (`sleep_ms`, `sleep`, `sleep_until`), and
 - awaitable sleep promises (`sleep_ms_async`, `sleep_async`, `sleep_until_async`) that can
 park a coroutine when running under the hosted executor.

See also:

- [concurrency](?p=language/concurrency) (language-level `async`/`task`/`yield`/`await` and structured blocks)
- [sync](?p=std/sync) (`Mutex`, `Condvar`, and channels)
- [runtime](?p=std/runtime) (pluggable runtime layer under `std::task`)

## Exported API
```silk
module std::task;

enum SleepUntilErrorKind { NoMonotonicClock, Unknown }
error SleepUntilFailed { code: int }

// Return the number of logical CPUs available (>= 1).
export fn available_parallelism () -> int;

// Hint to the OS scheduler that the current thread can yield.
export fn yield_now () -> void;

// Block the current OS thread for at least `ms` milliseconds.
export fn sleep_ms (ms: int) -> void;

// Return an awaitable sleep promise for at least `ms` milliseconds.
export fn sleep_ms_async (ms: int) -> Promise(void);

// Block the current OS thread for at least `d`.
export fn sleep (d: Duration) -> void;

// Return an awaitable sleep promise for at least `d` (millisecond resolution).
export fn sleep_async (d: Duration) -> Promise(void);

// Block the current OS thread until `deadline` (monotonic time).
export fn sleep_until (deadline: Instant) -> SleepUntilFailed?;

// Awaitably sleep until `deadline` (monotonic time; millisecond resolution).
export async fn sleep_until_async (deadline: Instant) -> SleepUntilFailed?;

// Consume a Task(T) handle and return its next produced value.
export async fn (T) join (h: Task(T)) -> T;

// Like `join`, with an explicit reserved fallback for future widening.
export async fn (T) join_or (fallback: T, h: Task(T)) -> T;
```

Notes:

- `available_parallelism()` is intended to be used by future schedulers and
 higher-level concurrency utilities. It is implemented using a hosted libc
 query (`get_nprocs`) and clamps to `>= 1`.
- `yield_now()` and `sleep_ms()` are blocking thread operations (they are not
 async-aware).
- `sleep_ms(ms)` is implemented by converting `ms` to microseconds and calling
 `std::runtime::task::sleep_us`; large sleeps may be performed in chunks.
- `sleep_ms_async(ms)` returns a `Promise(void)` that can be awaited inside
 `async` code. Under the hosted executor, awaiting this promise parks the
 current coroutine; outside an executor it may fall back to blocking sleep.
- `sleep(d)` is a blocking thread operation and is implemented using `usleep`
 (microsecond resolution, rounded up).
- `sleep_async(d)` returns a `Promise(void)` using millisecond resolution
 (rounds up to the next millisecond).
- `sleep_until(deadline)` is a blocking thread operation and is implemented by
 reading `std::temporal::now_monotonic()` and calling `sleep(deadline - now)`.
 - It returns `Some(SleepUntilFailed{ ... })` when a monotonic clock read fails
 (`std::temporal::now_monotonic()` returns `Err(...)`).
- `sleep_until_async(deadline)` is an awaitable operation and is implemented by
 reading `std::temporal::now_monotonic()` and awaiting `sleep_async(deadline - now)`.
 - It returns `Some(SleepUntilFailed{ ... })` when a monotonic clock read fails
 (`std::temporal::now_monotonic()` returns `Err(...)`).
- `join(h)` is the reusable helper for the common `Task(T)` shape that yields
 one final value and no intermediate stream that the caller wants to keep.
 It consumes the handle.
- `join_or(fallback, h)` currently behaves like `join(h)` while keeping the
 fallback explicit at the call site for future widening of the helper surface.

Implementation note:

- In the shipped stdlib, `std::task` delegates its OS-facing behavior to the
 pluggable runtime interface `std::runtime::task` (which defaults to a POSIX
 backend under `std::runtime::posix::task`).
