# Testing

Silk testing is **language-level**: tests live next to the code they exercise. The compiler discovers them, runs them with
`silk test`, and emits TAP output (TAP v13) so results are easy to consume in CI and existing tooling.

The goal is a workflow where “write code + write tests” is the default, not a separate phase.

## A basic test

```silk
import std::test::expect_equal;

test "addition" {
  expect_equal(3, 1 + 2);
}
```

Run it:

```bash
silk test hello.slk
```

## Nested tests

Tests can be nested to share setup and group behavior:

```silk
import std::test::expect_equal;

fn add (a: int, b: int) -> int { return a + b; }

test "math" {
  test "addition" {
    expect_equal(4, add(2, 2));
  }

  test "associativity (small sample)" {
    expect_equal(add(add(1, 2), 3), add(1, add(2, 3)));
  }
}
```

Nested tests execute inline (in source order) as part of the enclosing test, which makes them a natural fit for
hierarchical grouping and shared setup.

## Assertions and failures

Inside `silk test` builds, failed assertions **record failures** instead of aborting the entire run. That means one test run
can report multiple failures, which is valuable when you’re iterating.

You have two complementary tools:

- `assert <cond>;` — built-in assertion syntax
- `std::test` helpers — ergonomic test-only helpers (`expect`, `expect_equal`, `expect_error`)

Example:

```silk
import std::test;

test "example" {
  test::expect(1 + 1 == 2, Some("basic arithmetic"));
}
```

## TAP output (tooling-friendly)

The runner emits TAP v13:

- `TAP version 13`
- `1..N`
- `ok <n> - <name>`
- `not ok <n> - <name>`

This makes Silk tests easy to integrate with existing CI systems and TAP consumers.

## Filtering tests

When you have a larger suite, you can run a subset:

```bash
silk test src/main.slk --filter addition
```

The filter matches test names (substring match), which keeps it practical for “run the one I’m working on” loops.

## What makes Silk testing valuable

Silk’s testing model has a few strong properties:

- **Co-location:** tests live with the code they validate.
- **Good failure reporting:** failures are recorded and execution continues, so you see more than the first failure.
- **Tooling-friendly output:** TAP output integrates with existing test tooling.
- **Language integration:** the compiler understands tests as part of the language, not as an external framework.

## Next

- [Formal Silk](?p=guides/formal-silk)
