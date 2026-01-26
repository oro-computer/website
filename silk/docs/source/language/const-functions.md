# Const Functions (`const fn`)

## Status

- Parser: **implemented**
- Checker rules: **implemented** (current subset)
- Compile-time evaluation: **implemented** (current subset)

This document defines the surface syntax and semantics for compile-time
functions.

In the current compiler subset, `const fn` (and `const pure fn`) can be called
from `const` binding initializers when all arguments and the result are
compile-time scalar values.

## Summary

Silk supports compile-time evaluation of certain expressions to produce
compile-time constants. `const fn` (and `const pure fn`) declarations opt a
function into this compile-time evaluation system so that it can be called from
compile-time contexts (for example, a `const` binding initializer).

## Syntax

`const` is a function modifier:

```silk
const fn add (a: int, b: int) -> int {
  return a + b;
}

const pure fn add2 (a: int, b: int) -> int {
  return a + b;
}
```

Notes:

- `const pure fn` is simply a `const fn` that also opts into the `pure` rules
  (see `function-disciplines.md`).
- `const fn` is a **compile-time-only** function:
  - it may be called only from compile-time contexts (for example `const`
    initializers and Formal Silk specifications),
  - it is not emitted as a runtime/linkable symbol in executable, object, or
    library outputs.

## Compile-Time Values (Current Subset)

In this document, a “compile-time value” is a value that the compiler can
produce and manipulate during compile-time evaluation.

Current subset (initial implementation target):

- scalar primitives:
  - `bool`
  - fixed-width integers (`i8`, `u8`, `i16`, `u16`, `i32`, `u32`, `i64`, `u64`)
  - `int`
  - `f32`, `f64`
  - `char`
  - `Instant`, `Duration`

Planned (not yet supported for `const fn` in the current subset):

- `string` values (string literals are supported directly in `const` bindings),
- aggregate values (struct/enum/optional/slice/array) as return values,
- function values as compile-time values (for higher-order const evaluation).

## Rules (Current Subset)

The current subset defines a deliberately small “const-eval VM” surface. A
`const fn` must fit within this surface.

### Signature rules

In the current subset, a `const fn`:

- must not be `task` or `async`,
- must not declare a typed-error contract (`-> T | ErrorType...`),
- must have a non-`void` return type that is a compile-time value type,
- must have parameters whose types are compile-time value types.

### Body rules

In the current subset, a `const fn`:

- must not allocate (`new`) and must not use regions/`with`,
- must not contain `panic` statements,
- must not declare `const` local bindings,
- may call only other `const fn` declarations,
- is restricted to a small expression subset over scalar values:
  - literals and local names (parameters and `let` bindings; no global `const` reads in the current subset),
  - `as` casts between supported scalar types,
  - unary operators: `-`, `~`, `!`,
  - binary operators:
    - arithmetic: `+`, `-`, `*` (division/modulo are currently not part of the const-eval subset),
    - bitwise: `&`, `|`, `^`, `<<`, `>>`,
    - comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=`,
  - `if` expressions (`if cond { a } else { b }`).
  - assignments to local names: `=`, `+=`, `-=`, `*=`, plus `++`/`--`.

Control flow is limited to:

- `if` / `else` statements,
- `while` loops with boolean conditions,
- `break` / `continue`,
- `return` statements.

## Calling Const Functions

The initial intended compile-time use site is `const` bindings:

```silk
const fn add (a: int, b: int) -> int {
  return a + b;
}

const answer: int = add(20, 22);

fn main () -> int {
  return answer;
}
```

Const functions may also be imported/exported across modules/packages like
runtime declarations, but they are still compile-time-only: importing a `const
fn` does not make it callable from runtime code.

## “No Static Storage” Rule

Const functions do not create new static storage. In particular:

- compile-time execution may compute scalar values and fold them into constants,
- compile-time execution must not allocate heap memory,
- compile-time execution must not synthesize new global read-only data (for
  example, it cannot build a new string at compile time in the current subset).

String literals are still backed by read-only static storage, but they are
introduced by the literal syntax itself (see `literals-string.md`), not by the
`const fn` evaluator.

## Evaluation Limits (Current Implementation)

Compile-time evaluation must terminate. The current implementation enforces an
instruction budget and a call-depth budget when executing `const fn` bodies at
compile time; evaluation that exceeds these budgets is rejected as not
compile-time evaluable.
