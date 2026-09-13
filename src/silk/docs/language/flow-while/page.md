---
layout: "docs"
title: "while Loop"
description: "The while loop repeatedly executes a block while a boolean condition holds."
docsCollection: "silk"
section: "language"
order: 17
sourcePath: "language/flow-while.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`while`](/silk/wiki/language/flow-while/) Loop

The [`while`](/silk/wiki/language/flow-while/) loop repeatedly executes a block while a boolean condition holds.

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

## `while let` (Pattern-Destructuring Loop Form)

Silk supports a `while let` loop form for iterating while a refutable pattern
matches:

```silk
while let <pattern> = <scrutinee> {
  ...
}

while let mut <pattern> = <scrutinee> {
  ...
}
```

Notes:

- The scrutinee expression is evaluated once per iteration.
- The pattern binders (for example `Some(v)` binds `v`) are in scope only in
 the loop body.
- `while let mut` marks binders introduced by the pattern as mutable for that
 iteration's loop body.
- The loop exits when the scrutinee does not match the pattern.
- Supported patterns are the same as `if let` (see [flow if else](/silk/docs/language/flow-if-else/)).

### `while let` chains (`&& let`)

The `while let` loop form supports the same short-circuiting `&&` chain syntax
as `if let`, mixing refutable `let` clauses and ordinary boolean clauses:

```silk
fn main () -> int {
  var x: int? = Some(3);
  var sum: int = 0;

  while let mut Some(v) = x && v > 0 {
    let original = v;
    v = v + 1;
    sum = sum + v;
    x = if original <= 1 { None } else { Some(original - 1) };
  }

  return sum;
}
```

Semantics:

- Clauses are evaluated left-to-right and short-circuit like `&&`.
- `let` clause binders are in scope for subsequent clauses and for the loop
 body, but they do not escape the loop.
- `let mut` clauses introduce mutable binders for subsequent clauses and for
 that iteration's loop body.
- `let move` clauses consume their scrutinee for ownership-tracked values. This
 is most useful when the scrutinee is a fresh expression each iteration, such
 as `while let move Some(value) = next() { ... }`; a moved local source binding
 is unavailable to later clauses, the loop body, and code after the loop.
- The loop exits when any clause fails (pattern mismatch or boolean `false`).

Parsing note (Supported forms):

- `&&` at the top level is parsed as a clause separator. Use parentheses if a
 clause needs its own `&&` / `||` / `??` expression at the top level.

Example (optional countdown):

```silk
fn main () -> int {
  var x: int? = Some(3);
  var sum: int = 0;

  while let Some(v) = x {
    sum = sum + v;
    if v <= 1 {
      x = None;
    } else {
      x = Some(v - 1);
    }
  }

  // 3 + 2 + 1 = 6
  return sum;
}
```

### Loop Specifications (`#invariant` / `#variant` / `#monovariant`)

The language supports attaching loop specifications immediately before a
[`while`](/silk/wiki/language/flow-while/). This is part of Formal Silk (see [formal verification](/silk/docs/language/formal-verification/)).
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

- `break` exits the nearest enclosing loop ([flow break](/silk/docs/language/flow-break/)).
- `continue` skips to the next iteration ([flow continue](/silk/docs/language/flow-continue/)).
- `return` exits the function ([flow return](/silk/docs/language/flow-return/)).
- `panic` exits the function via the typed error system ([typed errors](/silk/docs/language/typed-errors/)).

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

## Notes

Supported forms:

- [`while`](/silk/wiki/language/flow-while/) loops with boolean conditions.
- `while let <pattern> = <expr> { ... }` pattern-destructuring loops.
- `&&` let-chains in `while let` loop conditions.
- `break` / `continue` inside [`while`](/silk/wiki/language/flow-while/) bodies.
- `#invariant` (type-checked as `bool`), `#variant` (type-checked as an
 integer), and `#monovariant` (type-checked as an integer) attached to [`while`](/silk/wiki/language/flow-while/).

examples:
