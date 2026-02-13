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
concurrency scope semantics, and task-safety (`Send`/`Sync`)-like rules remain
future work. See `docs/language/concurrency.md` for the concurrency model and
implementation status.

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

## Intended Call Rules (Design)

The checker is expected to enforce:

- `pure` code may call only `pure` code (and cannot perform I/O or mutation
  outside local, non-escaping temporaries).
- `task` code may call `task` and `pure` code, and must satisfy task-safety
  rules for captured/argument data.
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
  - `yield` sends task values (`yield v;`) and receives task values (`yield t`),
    and `yield * t` drains/collects remaining task values into `T[]`,
  - `await` unwraps `Promise(T)` and yields `T` (`await Task(T)` is rejected),
    and `await * ps` unwraps `Promise(T)[]` into `T[]`.
- `await <expr>` and `async { ... }` / `task { ... }` blocks are enforced as
  **async-only** constructs:
  - `await` is only permitted inside `async` functions (including `async task fn`),
  - `async { ... }` / `task { ... }` blocks are only permitted inside `async` functions.
- `yield <expr>` is enforced as a **task-only** construct:
  - `yield` is permitted only inside `task` functions (`task fn` / `async task fn`)
    and inside `task { ... }` / `task loop { ... }` blocks.
- Lowering/codegen implements `task` execution using OS threads on `linux/x86_64`
  and implements `yield`/`yield *` for task values plus `await` for promises.
  - On hosted `linux/x86_64`, the compiler ships a bring-up async runtime
    (`src/silk_rt_async.c`) so `await` is a true suspension point:
    - awaiting a pending `Promise(T)` parks the current fiber and allows other
      runnable fibers to execute (it does not block the OS thread),
    - outside an active executor, awaiting may fall back to blocking behavior.
    - the long-term design remains a compiler coroutine transform plus a stable
      `std::runtime::event_loop` API; see `docs/compiler/async-runtime.md`.
  - `async { ... }` / `task { ... }` blocks are still lexical blocks in the
    current subset (they do not yet introduce scheduler behavior).
- Function types are parsed in type positions (notably for `ext`).
- Function expressions are implemented as first-class function values:
  - `fn (x: int) -> x + 1` (expression body),
  - `fn (x: int) -> int { return x + 1; }` (block body).
  - `fn (x: int) { ... }` (block body, implicit `void` result).
  - Function expressions may not declare `&T` parameters.
  - Non-capturing function expressions are inferred as `pure` and are callable
    from `pure` code.
  - Capturing closures are supported as a subset:
    - a function expression may reference immutable locals/parameters from an
      enclosing scope,
    - captures are by-value copies into a heap environment (scalar-only in the
      current subset),
    - forming captures inside `pure` code is rejected (capture environments
      allocate), but closure *values* are still checked under the `pure` rules
      and remain callable from `pure` code once constructed.
  - Function values (both non-capturing and capturing) are supported end-to-end:
    they may be passed, returned, stored, and called indirectly.
