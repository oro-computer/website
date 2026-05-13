# Testing (`test`)

Silk supports top-level `test` declarations that are discovered and executed by
`silk test`.

Tests live next to the code they exercise. That keeps small examples, library
checks, and regression tests in the same module set as the declarations they
validate.

## Syntax

```silk
import { abort } from "std/runtime";

test "addition works" {
  if (1 + 2) != 3 {
    abort();
  }
}
```

The name is optional, but named tests produce clearer TAP output:

```silk
test {
  // unnamed test block
}
```

## Nested Tests

Nested `test` blocks are scoped subtests. They run in source order inside the
outer test and report progress using a path-like name.

```silk
test "math" {
  test "add" {
    if (1 + 2) != 3 { abort(); }
  }

  test "multiply" {
    if (2 * 3) != 6 { abort(); }
  }
}
```

## Assertions

Use ordinary `assert` for quick checks, or `std/test` helpers when you want
test-aware failure reporting.

```silk
import { expect_equal } from "std/test";

fn add (a: int, b: int) -> int {
  return a + b;
}

test "add returns the sum" {
  expect_equal(5, add(2, 3));
}
```

In test builds, assertion failures are reported as test failures instead of
silently passing through the suite.

## Running

```sh
silk test hello.slk
silk test --package .
```

The runner emits TAP output, so CI systems and other tools can consume the
result without a Silk-specific adapter.

## Where Tests Fit

- use `silk check` for fast parsing and type checking
- use `silk test` for executable behavior and assertions
- use `silk build` when you need the final artifact

## See also

- Reference: [testing](../docs/?p=language/testing)
- CLI runner: [cli silk](../docs/?p=compiler/cli-silk)
- Test helpers: [`std::test`](../docs/?p=std/test)
