# Errors

This document summarizes the Silk error-handling model at a level suitable for compiler implementation. It is based on the language design captured in `docs/` (optionals, verification, `ext`, ABI).

For unrecoverable logic bugs and contract violations, Silk uses **typed
errors** (`error`, `panic`, and `T | ErrorType...`), specified in
`docs/language/typed-errors.md`.

## Implementation Status (Current Compiler)

- Typed errors are implemented end-to-end for the current front-end and the
  `linux/x86_64` backends (see `docs/language/typed-errors.md`).
- `assert` is implemented:
  - in release builds, a failed assertion traps immediately,
  - in debug builds on `linux/x86_64` (`silk build --debug` / `-g`), a failed
    assertion prints a panic header, an optional message, and a stack trace
    before aborting.
- In `silk test` builds, failed assertions record a test failure and execution
  continues (the test process exits non-zero when failures were recorded). See
  `docs/language/testing.md`.

## Design Goals

- Error signaling is explicit and typed (no hidden global error state).
- Error paths are part of normal control flow, not out-of-band exceptions.
- The verifier can reason about both success and error paths symmetrically.
- The C99 ABI must be able to represent error outcomes in a stable, documented way.

## Recoverable Errors (Recommended Pattern)

Silk distinguishes between:

- **Recoverable errors** (invalid user input, I/O failures, parse failures): model
  these as normal values, typically using `std::result::Result(T, E)` or an
  optional (`T?`).
- **Typed errors** (`T | ErrorType...` + `panic`): reserved for unrecoverable
  contract violations and logic bugs that should not be silently ignored (see
  `docs/language/typed-errors.md`).

### Example: Recovering from URL parse errors

`std::url` exposes a recoverable parsing API (`std::url::parse`) that returns a
tagged result (`std::url::URLResult`), so callers can report an error and keep
going without aborting.

A runnable example that wraps `URLResult` into `std::result::Result` and parses
all command-line arguments is in:

- `examples/feature_errors_recoverable_url_parse.slk`

## Error Representation

From the overall language design:

- Silk favors explicit types such as:
  - optionals (`T?` / `Option(T)`) for “may be present / may be absent” values.
  - domain-specific error types (enums or structs) for richer error reporting.
- Functions that can fail should surface that in their type signatures:
  - either by returning a value that encodes both success and error (e.g. an optional or a nominal error-aware type),
  - or by returning an error-only type where success is absence of error.

The naming and shapes of error-carrying types are defined by this language spec and by standard library APIs, but the compiler must:

- treat them as regular, first-class types,
- enforce that callers handle them appropriately (e.g. via pattern matching, explicit checks).

## Interaction with Control Flow

Error-aware types integrate with control flow constructs:

- `if` / `match` can be used to branch on error vs. success cases.
- Pattern matching can destructure enum-based error types, exposing error codes or payloads.
- Optionals (`T?`) can be used where “absence” is a common error shape; they compose with `?.` and `??` to keep code concise while still explicit.

The compiler must:

- ensure that branches that depend on error conditions are type-checked,
- support exhaustiveness checks when matching on error enums/types.

## Verification and Errors

Formal Silk constructs (`#require`, `#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`) apply equally to:

- success paths (e.g. postconditions describing the returned value),
- error paths (e.g. guarantees about when and how certain errors can occur).

The verifier should be able to:

- treat error-carrying types as ordinary values with invariants,
- prove that certain errors cannot happen given preconditions,
- or, conversely, require explicit handling of error cases when the proof cannot eliminate them.

## ABI and FFI Considerations

On the C99 side:

- Error values exposed through `libsilk.a` should use well-defined C types (e.g. enums or structs) documented in `docs/compiler/abi-libsilk.md`.
- For external functions declared via `ext`, any error behavior must be captured in the Silk-side function type and corresponding C signature (e.g. error-return codes, nullable pointers, or explicit error structs).

The compiler must:

- preserve error-related information across the FFI boundary,
- avoid implicit, hidden error channels (such as untracked global error codes) in favor of explicit parameters or return values.

## Assertions (`assert`)

`assert` is a debugging/safety construct intended to catch programmer mistakes.
It is **not** part of Silk’s typed error model and is not a replacement for
returning optionals or `Result(...)`.

Syntax (initial):

- `assert <Expr>;`
- `assert (<Expr>, <message>?);`

Rules:

- The condition expression must type-check as `bool`.
- The optional message, when present, must type-check as `string`.

Runtime behavior (current compiler subset):

- By default (release builds), if the condition evaluates to `false`, execution
  traps immediately (a panic-like abort). In the current `linux/x86_64` backend
  this is implemented as an invalid-instruction trap.
- In debug builds (`silk build --debug` / `-g`) on `linux/x86_64`, a failed
  assertion prints a panic header, the optional message (when present), and a
  stack trace to stderr when available (via glibc `backtrace_symbols_fd`)
  before aborting.

Notes:

- Failed assertions are currently isolated by the `silk test` runner (each
  test runs in its own process). Future work may allow reporting failed
  assertions without process isolation (for example by lowering `assert` to a
  typed error in test contexts).
- See also: `docs/language/testing.md`.
