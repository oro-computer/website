# Function Disciplines (`pure`, `task`, `async`)

This document specifies Silk’s intended “function discipline” system: how
functions declare whether they are pure, asynchronous, or safe to run as
parallel tasks.

Const functions (`const fn`) are specified separately in
`docs/language/const-functions.md`. The `const` modifier is orthogonal to the
discipline system described here (a `const fn` may also be declared `pure`).

Status: **design in progress**, but the current compiler subset now implements
`pure fn` parsing and a strict purity checker. Concurrency disciplines (`task` /
`async`) are parsed and `Task(T)` / `Promise(T)` handles plus `yield` (task
values) and `await` (promise values) are implemented in the current subset
(`await Task(T)` is rejected). On the hosted `linux/x86_64` target, the compiler
now ships a bring-up async runtime (single-threaded executor + stackful
coroutines in `libsilk_rt`) so `await` can suspend and resume without blocking
the OS thread. A compiler state-machine coroutine transform, structured
concurrency scope semantics, and richer Send/Sync-style reasoning remain future
work. The current compiler already enforces an initial task-boundary safety
rule (`E2037`) that rejects non-opaque references across `task fn` boundaries.
See `docs/language/concurrency.md` for the concurrency model and implementation
status.

## Overview

The language design distinguishes:

- `fn` — normal function (may perform effects; blocking).
- `pure fn` — function with no observable side effects (referentially
  transparent).
- `task fn` — function safe to execute on a worker pool as a parallel task.
- `async fn` — function that may suspend at `await` points (returns an
  awaitable).
- `async task fn` — async function executed as a separate task (self-contained
  worker).

## Example

```silk
pure fn add (x: int, y: int) -> int {
  return x + y;
}

task fn worker (x: int) -> int {
  return add(x, 1);
}

async fn answer () -> int {
  return 42;
}

async fn main () -> int {
  let p = answer();

  task {
    let values: int[] = yield * worker(41);
    let v: int = await p;
    if values[0] != 42 { return 1; }
    if v != 42 { return 2; }
    return 0;
  }
}
```

## Intended Call Rules (Design)

The checker is expected to enforce:

- `pure` code may call only `pure` code (and cannot perform I/O or mutation
  outside local, non-escaping temporaries).
- `task` code may call `task`, `pure`, and `async` code, but any resulting
  `Task(T)` / `Promise(T)` handles must be consumed explicitly with
  `yield` / `yield *` / `await`, and task-boundary argument/result data must
  satisfy the current task-safety rules.
- `async` code may `await` other async operations; it may call `pure` code and
  may offload blocking work via explicit adapters (planned intrinsics).

Crossing discipline boundaries is intended to be explicit and diagnostic-driven
(for example suggesting the correct adapter/intrinsic).

## Standard Intrinsics (Planned)

The standard library is expected to provide typed adapters to cross boundaries
safely (names and exact signatures are design work):

- lifting sync work onto a task pool,
- presenting a task as an async operation,
- running blocking work from async without stalling the event loop,
- structured spawn/join primitives.

These APIs are not yet present in the in-tree `std/` implementation.

## Implementation Notes (Current Compiler)

Today:

- `pure fn` is parsed and checked (current subset):
  - a `pure fn` may call only `pure` functions; `ext` is treated as impure,
  - the checker also supports purity inference (“auto-pure”) for ordinary `fn`
    declarations and `impl` methods:
    - when an unannotated function/method has an eligible signature and its
      body satisfies the purity rules, it is treated as `pure` for call
      checking, and may be called from `pure` code,
    - functions/methods with `&T` parameters are not eligible for inference
      (explicit `pure fn` remains supported for `&T` parameters in the current
      subset),
  - `pure` cannot be combined with `task` or `async` in the current subset,
  - a `pure fn` may not have `mut` parameters,
  - a `pure fn` may not declare mutable locals (`var` or `let mut`) and may not
    perform mutation via assignment,
  - a `pure fn` may not allocate (`new`) in the current subset,
  - a `pure fn` may not have a typed-error contract (`-> T | Error...`) and may
    not contain `panic` statements.
- `task fn`, `async fn`, and `async task fn` are parsed and preserved in the AST.
- Calls across disciplines are now reflected in expression types:
  - calling a `task fn` yields `Task(T)`,
  - calling an `async fn` yields `Promise(T)`,
  - calling an `async task fn` yields `Promise(Task(T))`,
  - `yield` supports both statement and expression forms:
    - statement forms (only inside an enclosing `task fn` / `async task fn`):
      - `yield v;` sends a value to the task’s yield stream,
      - `yield * t;` forwards all values from `t` into the task’s yield stream,
    - expression forms:
      - `yield t` receives the next yielded value from `t`,
      - `yield * t` drains/collects remaining values from `t` into `T[]`,
  - `await` unwraps `Promise(T)` and yields `T` (`await Task(T)` is rejected),
    and `await * ps` unwraps `Promise(T)[]` into `T[]`.
- `await <expr>` and `async { ... }` / `task { ... }` blocks are enforced as
  **async-only** constructs:
  - `await` is only permitted inside `async` functions (including `async task fn`),
  - `async { ... }` / `task { ... }` blocks are only permitted inside `async` functions.
- `yield <expr>` is enforced as a **task-only** construct:
  - `yield` expression forms (`yield t` / `yield * t`) are permitted only inside
    `task` functions (`task fn` / `async task fn`) and inside `task { ... }` /
    `task loop { ... }` blocks.
  - `yield` statement forms (`yield v;` / `yield * t;`) require an enclosing
    `task fn` / `async task fn`.
- Lowering/codegen implements `task` execution using OS threads on `linux/x86_64`
  and implements `yield`/`yield *` for task values plus `await` for promises.
  - By default, each `task fn` call spawns a dedicated OS thread.
  - When a `task fn` / `async task fn` is annotated with `attr(task=pool)` (or
    `attr(task_pool)`), calls are scheduled on the global task pool instead.
  - On hosted `linux/x86_64`, the compiler ships a bundled bring-up async
    runtime so `await` is a true suspension point:
    - awaiting a pending `Promise(T)` parks the current fiber and allows other
      runnable fibers to execute (it does not block the OS thread),
    - outside the executor owner thread (including when no executor is active),
      `await` blocks the OS thread until the promise resolves.
    - the long-term design remains a compiler coroutine transform plus a stable
      `std::runtime::event_loop` API; see `docs/compiler/async-runtime.md`.
  - `async { ... }` / `task { ... }` blocks are still lexical blocks in the
    current subset (they do not yet introduce scheduler behavior).
- Function types are parsed in type positions (notably for `ext`).
- Function expressions are implemented as first-class function values:
  - `fn (x: int) -> x + 1` (expression body),
  - `fn (x: int) -> int { return x + 1; }` (block body).
  - `fn (x: int) { ... }` (block body, implicit `void` result).
  - Function expressions may not declare `&Struct` parameters; only single-slot
    scalar `&T` parameters (for example `&int`) are supported in the current subset.
  - Function expressions are eligible for purity inference (“auto-pure”):
    - when the body satisfies the `pure` rules, the function value is treated
      as `pure` for call checking (it may be called from `pure` code),
    - otherwise the function value is impure and may not be called from `pure`
      code.
  - Capturing closures are supported as a subset:
    - a function expression may reference immutable locals/parameters from an
      enclosing scope,
    - captures are by-value copies into a heap environment (scalar-only in the
      current subset),
    - forming captures inside `pure` code is rejected (capture environments
      allocate),
    - capturing closures are also eligible for purity inference (a closure
      whose body satisfies the `pure` rules is callable from `pure` code).
  - Function values (both non-capturing and capturing) are supported end-to-end:
    they may be passed, returned, stored, and called indirectly.
