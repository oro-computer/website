# Typed Errors (`error`, `panic`, and `T | ErrorType...`)

Silk’s typed error system exists to eliminate the “trust gap” between a
function’s signature and its real behavior. There are no hidden exceptions and
no implicit panic channel: if a function can terminate due to a logic bug /
contract violation, it must say so in its signature, and the compiler must
enforce it.

This document specifies the surface syntax and checker rules for typed errors.


The compiler supports `error` declarations, `panic` statements, error-aware
return types (`T | ErrorType...`), and the `match` *statement* form for handling
typed errors (including the Terminal Arm Rule), plus the postfix `?`
propagation operator for error-producing calls.

## Overview

- An `error` represents an unrecoverable logic bug or contract violation.
- A function that can `panic` must declare that in its return type using `|`:
 - `fn get_at(xs: u8[], index: int) -> u8 | OutOfBounds;`
- A typed error is triggered with `panic`, which terminates the current function
 and propagates the error to the caller.
- Typed errors are handled explicitly via `match` (statement form), and any arm
 that handles an error must end in a terminal statement.

This model is intentionally closer to “typed, explicit non-local errors” than
to try/catch exceptions or an implicit panic mechanism.

### Recoverable errors are values (not typed errors)

Typed errors are intentionally *not* the primary mechanism for routine runtime
failures such as:

- invalid user input,
- parsing failures,
- I/O failures.

Those should typically be modeled as ordinary values using `std::result::Result`
or optionals (`T?`) so callers can handle them and continue normal execution.

See:

- [errors](?p=language/errors) (overview),
- [result](?p=std/result) (recoverable `Result(T, E)`),
- [url](?p=std/url) and `examples/feature_errors_recoverable_url_parse.slk`
 (recoverable URL parsing example).

For ergonomic one-branch recovery over recoverable values, prefer `if let`,
`let ... else`, `while let`, or the recoverable `??` operator on optionals,
`Result` values, and other two-variant success/fallback enums rather than
`is_err()` / `is_none()` plus a second extraction step.

## Declaring Error Types (`error`)

Syntax:

```silk
error OutOfBounds {
  index: int,
  len: int
}
```

Rules:

- `error Name { ... }` declares a nominal, struct-like type that represents an
 unrecoverable logic bug / contract violation.
- An `error` declaration has the same field rules as `struct` in the current
 compiler subset (scalar fields; see
 [structs impls layout](?p=language/structs-impls-layout)).
- An `error` type may also be used as data (returned, stored, logged) when it is
 *not* part of a `T | ...` error contract.

Implementation

- The compiler treats `error` as a distinct nominal type category (separate from
 `struct`) but reuses the same field/layout rules in the Supported forms.

## Error-Producing Function Signatures (`T | ErrorType...`)

A function declares that it may `panic` by adding one or more error types after
its success type using `|`.

Examples:

```silk
fn get_at(xs: u8[], index: int) -> u8 | OutOfBounds { ... }
fn parse() -> Frame? | FrameTooLarge { ... }
fn init() -> void | InitFailure { ... }
```

Note on `|` disambiguation:

- In function declarations, an unparenthesized `|` sequence after `->` is
 always parsed as a typed-error contract.
- To return a **union type** from a function, parenthesize the union:
 - `fn f () -> (A | B);`
 - `fn g () -> (A | B) | SomeError;`

See [type unions](?p=language/type-unions) for union types.

Rules:

- The leftmost type is the single *success* type.
- Each type on the right side of `|` must name a declared `error` type.
- The list of error types in a signature is the complete contract: the
 implementation may not `panic` with any other error type.

Implementation notes:

- The current compiler models typed errors as a distinct “error set” attached to
 the function signature and to expressions that may `panic`.
- The success type is still a normal Silk type (including optionals).

## Triggering a Typed Error (`panic`)

Syntax:

```silk
panic OutOfBounds {
  index: index,
  len: len
};
```

In a real implementation, the `len` value typically comes from the relevant
container/view (for example a `.len()` method via `std::interfaces::Len`).

Rules:

- `panic` constructs a value of the named `error` type and immediately
 terminates the current function, propagating the error to the caller.
- A `panic X { ... };` statement is only legal inside a function whose signature
 includes `| X` (directly or indirectly via propagation).

Implementation notes:

- `panic` is a statement (not an expression) in Silk currently.

## Propagating Typed Errors (`?`)

The postfix `?` operator propagates a typed error from an *error-producing call
expression* to the caller without requiring an explicit `match` at every call
site.

Syntax:

```silk
let value: T = error_call(...)?;
```

Semantics:

- If the call succeeds, `call()?` evaluates to the call’s success value.
- If the call panics with a declared error type, `call()?` immediately returns
 from the current function, propagating the same error to the caller.

Rules:

- `?` is only legal inside a function that declares an error contract
 (`-> SuccessType | ErrorType...`).
- The callee’s error set must be a subset of the enclosing function’s error set.
 Otherwise the call must be handled explicitly with a `match` statement that
 maps the error into the caller’s contract.
- `?` is only meaningful on an error-producing call expression (a call whose
 signature includes `| ErrorType...`). Applying `?` to an infallible call is a
 type-check error.

Implementation notes:

- In the current compiler, `call()?` is lowered as “call + tag dispatch; on
 error return the appropriate error payload; on success yield the value”,
 using the same encoding as the `match` statement lowering.

### Async Calls and `await`

Typed-error propagation already composes with async calls in the current
subset, but the fallible expression is still the async **call** rather than the
`await` operator.

For example:

```silk
error OpenFailed {
  code: int,
}

async fn open_value () -> int | OpenFailed {
  return 1;
}
```

In the Supported forms:

- `open_value()` is treated as an error-producing call whose success value is
 `Promise(int)`.
- `let p: Promise(int) = open_value()?;` is valid inside a caller whose error
 contract includes `OpenFailed`.
- `let v: int = await open_value()?;` is valid and is the supported shorthand
 when the caller wants the resolved success value directly.
- `await open_value()` without `?` or an explicit `match` on `open_value()` is
 rejected with `E2023`.

If you need explicit handling, match on the async call and await the promise in
the success arm:

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

## Handling Typed Errors (`match` statement + Terminal Arm Rule)

When the scrutinee expression of a `match` statement may `panic` (i.e. its
signature includes `|`), the compiler activates a special rule for error arms.

### Match statement form

```silk
match (create_frame(user_size)) {
  Some(frame) => {
    io::println("ok");
  },
  None => {
    io::println("no frame");
  },
  err: FrameTooLarge => {
    log::critical("invalid frame size requested", err);
    std::abort();
  }
}
```

### Terminal Arm Rule

If the scrutinee expression has an error contract (`T | ErrorType...`), then
for any arm that matches an `error` type, the arm’s block must end with a
terminal statement.

Terminal statements are:

- `panic <ErrorType> { ... };` (propagate or map to another error)
- `std::abort();`
- `std::halt();`
- `std::reboot();`

Implementation notes:

- `std::abort()` is lowered as a terminal action:
 - in the native backend subset, this is routed through the platform
 `abort()` so the process terminates with `SIGABRT`,
 - in non-debug builds on `linux/x86_64`, the compiler disables core dumps
 (`prctl(PR_SET_DUMPABLE, 0, 0, 0, 0)`) before calling `abort()` to keep abort fast,
 - on backends/targets where `abort()` is unavailable, it is lowered to the
 backend’s `Trap` primitive.
- `std::halt()` and `std::reboot()` are currently lowered to `Trap` in the
 native backend subset.

This rule is intentionally *context-dependent*: it is triggered by the error
contract of the scrutinee expression, not by the fact that a type is declared
with `error`.

### Error types as data (no Terminal Arm Rule)

If a function returns an `error` type as a normal value (no `|` in its
signature), the special rule does not apply:

```silk
fn inspect_issues() -> FrameTooLarge;

match (inspect_issues()) {
  err: FrameTooLarge => {
    log::warn("non-critical issue", err);
    // Allowed to complete normally because the scrutinee is not a `T | ...`.
  }
}
```

### `match` statements over Result-like values (recoverable)

The `match` **statement** form can also be used to destructure common
recoverable result shapes such as `std::result::Result(T, E)`.

When the scrutinee expression is a **call expression** whose result type is
either:

- `std::result::Result(T, E)` (an `enum` with `Ok(T)` and `Err(E)` variants), or
- a “Result-like” struct with fields:
 - `value: T?`
 - `err: E?` where `E` is an `error` type,

then the checker accepts binder patterns of the form:

- `name => { ... }` / `_ => { ... }` for the success payload (binds `name` as `T`),
- `err: E => { ... }` for the error payload (binds `err` as `E`).

The Terminal Arm Rule does **not** apply in this form because the scrutinee is
not a `T | ErrorType...` typed-error expression; the error is a normal returned
value.

Runtime invariant (struct form, current backend): exactly one of `value` and
`err` must be `Some(...)`. If the invariant is broken, execution traps.

Implementation notes:

- The current compiler supports a match subset for optionals as an
 *expression* (`match x { None => expr, Some(v) => expr }`).
- The `match` expression also supports `Ok(...)` / `Err(...)` patterns for
 `Result` values (see [flow match](?p=language/flow-match)).
- Typed error handling uses the *statement* form of `match` with block arms.

## Restrictions

### `pure fn`

`pure fn` must not introduce or handle typed errors:

- `pure fn` may not have a `|` in its return type.
- `pure fn` may not contain `panic` statements.

The checker enforces these rules in Silk currently (see
[diagnostics](?p=compiler/diagnostics)).

### `ext` boundary

Typed errors must not cross the external boundary. External shims must translate
typed errors into:

- explicit error return codes,
- nullable pointers / optionals,
- explicit error structs/enums,
- or a terminal action appropriate for the platform.

the current compiler rejects `ext` declarations whose function types use
`|` (and rejects exported C ABI surfaces with `|`) in the current
implementation.

## Related proposals (not implemented)

- Open/variadic error sets for higher-order adapters (`E...`).
- `return <error>` as shorthand for `panic <error>` (AP131).
