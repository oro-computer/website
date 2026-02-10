# `std::task`

Status: **Implemented subset**. This module provides a small hosted baseline for
task/runtime utilities on `linux/x86_64`.

This is **not** the full structured-concurrency design, but the hosted
`linux/x86_64` toolchain now ships a bring-up async executor (fibers) used to
make `await` a true suspension point. In the current subset:

- `yield` / `yield *` are still blocking OS-thread operations (task runtime is thread-based).
- Sleep helpers are split into:
  - blocking thread sleeps (`sleep_ms`, `sleep`, `sleep_until`), and
  - awaitable sleep promises (`sleep_ms_async`, `sleep_async`) that can park a coroutine
    when running under the hosted executor.

See also:

- `docs/language/concurrency.md` (language-level `async`/`task`/`yield`/`await` and structured blocks)
- `docs/std/sync.md` (`Mutex`, `Condvar`, and channels)
- `docs/std/runtime.md` (pluggable runtime layer under `std::task`)

## Implemented API

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
```

Notes:

- `available_parallelism()` is intended to be used by future schedulers and
  higher-level concurrency utilities. It is implemented using a hosted libc
  query (`get_nprocs`) and clamps to `>= 1`.
- `yield_now()` and `sleep_ms()` are blocking thread operations (they are not
  async-aware.
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

Implementation note:

- In the shipped stdlib, `std::task` delegates its OS-facing behavior to the
  pluggable runtime interface `std::runtime::task` (which defaults to a POSIX
  backend under `std::runtime::posix::task`).
