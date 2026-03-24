# `std::test`

This module provides test-only helpers that
record test failures without aborting the process.

These helpers are intended to be used under `silk test` and integrate with the
language-level `assert` behavior in test builds (`docs/language/testing.md`).

Each helper also carries a Formal Silk contract requiring `BUILD_MODE == "test"`
via `std::test::requires_test_mode()` so downstream verification can model
them as test-only APIs.

## Exported API
### `expect`

```silk
expect(ok: bool, message: string? = None);
```

Semantics:

- When `ok` is `true`, `expect` does nothing.
- When `ok` is `false`, `expect` records a test failure.
  - When `message` is `Some(...)`, it is used as the failure message.
  - When `message` is `None`, the default message is `"expect failed"`.

### `expect_equal`

```silk
fn (X, Y) expect_equal (expected: X, actual: Y) -> bool;
```

Semantics:

- Returns `true` when `expected == (actual as X)` and records no failure.
- Returns `false` when `expected != (actual as X)` and records a failure.

Note: equality must be supported for the
concrete instantiated types used at the call site.

### `expect_error`

```silk
fn (E) expect_error (err: E?) -> bool;
```

Semantics:

- Returns `true` when `err` is `Some(...)`.
- Returns `false` when `err` is `None` and records a failure.

## Example

```silk
import std::test;

test "parsing smoke test" {
  let value = Some(42);

  std::test::expect(value != None, "value should be present");
  std::test::expect_equal(42, match (value) {
    Some(v) => v,
    None => 0,
  });
  std::test::expect_error(Some("boom"));
}
```
