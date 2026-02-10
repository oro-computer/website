# Testing

This document specifies the initial **language-level testing** surface for
Silk.

The goal is a Zig-like authoring experience (tests live next to the code they
exercise) with a simple CLI runner that emits modern TAP output for downstream
consumption.

## `test` declarations

A `test` declaration is a top-level block of statements that the compiler can
compile and execute under `silk test`.

Syntax:

```silk
test "name" {
  // statements...
}
```

The string name is optional:

```silk
test {
  // statements...
}
```

Rules:

- `test` declarations MAY appear:
  - at top level (like `fn` and `let`), and
  - nested inside another `test` block (scoped subtests).
- A `test` block introduces its own scope (like a function body).
- Nested `test` blocks are executed inline, in source order, as part of the
  enclosing test’s execution. They may be used for hierarchical grouping and
  shared setup.
- `test` blocks may use `let`, `var`, control flow, and call functions/methods
  using the same expression subset as normal code.
- `return;` is allowed inside a `test` block (equivalent to ending the test
  early). `return <expr>;` is not allowed.

Doc comments:

- Doc comments (`/** ... */` and `/// ...`) attach to a `test` declaration the
  same way they attach to other top-level declarations.

## Running tests (`silk test`)

The `silk test` command:

- loads a module set (like `silk check` / `silk build`),
- discovers all `test` declarations in the module set, and
- executes them, emitting TAP output.

### TAP output

The initial runner uses TAP version 13 formatting:

- `TAP version 13`
- `1..N`
- `ok <n> - <name>`
- `not ok <n> - <name>`

### Assertions inside tests

In `silk test` builds, failed assertions do not abort the process. Instead:

- A failed `assert` records a test failure and execution continues.
- If the assertion has no explicit message, the compiler uses the assertion
  condition text as the message (e.g. `assert value != 123;` uses `value != 123`).
- Failed assertions also emit a one-line detail message to stderr so failures are
  visible in `silk test` output without requiring `--debug`, formatted like:
  - `assertion failed: <message>` when not inside a nested `test` block, or
  - `assertion failed [test: a/b]: <message>` when inside nested `test` blocks
    (the nested `a/b` path reflects the active nested test name stack).
- The test executable exits non-zero if any failures were recorded so TAP output
  reflects failures.

The current runner still isolates top-level tests in separate processes, but a
single test case may now accumulate multiple failures.

## `std::test` (standard test helpers)

The standard library provides `std::test` helpers for test-only assertions that
record failures without aborting:

- `expect(ok: bool, message: string? = None);`
- `expect_equal(expected: X, actual: Y) -> bool;`
- `expect_error(err: E?) -> bool;`

See `docs/std/test.md` for the detailed API.

Note: `std::test` helpers carry a Formal Silk contract requiring
`BUILD_MODE == "test"` via `std::formal.requires_test_mode()` so downstream
verification can model them as test-only APIs.

## Status (implementation subset)

- Implemented: parsing of `test` declarations and `silk test` runner with TAP
  output.
- Implemented: `std::test` helpers and non-aborting assertions in test builds.
