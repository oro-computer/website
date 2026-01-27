# `while` Loop

The `while` loop repeatedly executes a block while a boolean condition holds.

## Surface Syntax

Minimal form:

```silk
while <condition> {
  // body
}
```

`<condition>` is an expression. Parentheses are optional because the condition
is parsed using the normal expression grammar:

```silk
while (x < y && y < 10) {
  ...
}
```

### Loop Specifications (`#invariant` / `#variant` / `#monovariant`)

The language supports attaching loop specifications immediately before a
`while`. This is part of Formal Silk (see `docs/language/formal-verification.md`).
When Formal Silk syntax is present, the compiler proves these obligations with
Z3 at compile time.

```silk
#invariant <expr>;
#variant <expr>;
#monovariant <expr>;
while <condition> {
  ...
}
```

## Semantics

Evaluation rules:

- The condition is evaluated before each iteration.
- If the condition evaluates to `true`, the body block executes.
- After the body completes normally, control returns to the condition.
- If the condition evaluates to `false`, the loop terminates and execution
  continues after the loop statement.

Control-flow statements inside the body follow their own definitions:

- `break` exits the nearest enclosing loop (`docs/language/flow-break.md`).
- `continue` skips to the next iteration (`docs/language/flow-continue.md`).
- `return` exits the function (`docs/language/flow-return.md`).
- `panic` exits the function via the typed error system (`docs/language/typed-errors.md`).

Blocks create scopes. A `let` declared inside the body is not visible outside
the loop’s body block.

## Type Checking Rules

The checker enforces:

- The loop condition must have type `bool` (otherwise `E2001`).
- Each `#invariant` expression must have type `bool` (otherwise `E2001`).
- If present, the `#variant` expression must have an integer type (`int` or a
  fixed-width integer; otherwise `E2001`).
- Each `#monovariant` expression must have an integer type (`int` or a
  fixed-width integer; otherwise `E2001`).

`#invariant`, `#variant`, and `#monovariant` expressions are compile-time-only
(erased from runtime code). When Formal Silk verification is enabled by syntax,
they are proved with Z3 during compilation.

## Examples

### Minimal loop with `break`

```silk
fn main () -> int {
  while true {
    break;
  }
  return 0;
}
```

### Loop with invariants and a variant

```silk
fn main () -> int {
  let limit: int = 3;
  #const original_limit = limit;

  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= original_limit;
  #variant original_limit - i;
  while i < limit {
    i = i + 1;
  }

  return 0;
}
```

## Implementation Status (Current Compiler Subset)

Implemented end-to-end:

- `while` loops with boolean conditions.
- `break` / `continue` inside `while` bodies.
- `#invariant` (type-checked as `bool`), `#variant` (type-checked as an
  integer), and `#monovariant` (type-checked as an integer) attached to `while`.

Examples that exercise the implemented subset:

- `tests/silk/pass_while_bool.slk`
- `tests/silk/pass_invariant_while.slk`
- `tests/silk/pass_spec_const_while.slk`
- `tests/silk/pass_nested_if_while.slk`
