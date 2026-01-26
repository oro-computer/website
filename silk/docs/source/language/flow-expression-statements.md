# Expression Statements

Expression statements allow expressions to be used for their side effects.

## Syntax

An expression statement is an expression followed by a semicolon:

```
expr;
```

## Semantics

- The expression is evaluated exactly once.
- The result value (if any) is discarded.

## Current implementation restrictions

For the current compiler subset, an expression statement is only valid when
the expression is either:

- a call expression (a function call), or
- an assignment / compound assignment expression.
- an increment/decrement expression (`++x`, `x++`, `--x`, `x--`).

All other expression statements are rejected.

This restriction will be relaxed as more of the expression language is lowered
and code-generated.

Examples (accepted in the current subset):

```silk
fn main () -> int {
  std::io::println("hello");

  let mut x: int = 0;
  x = 1;
  x += 2;
  x++;

  return 0;
}
```

Examples (rejected in the current subset):

```silk
fn main () -> int {
  1 + 2; // rejected: non-call/non-assignment expression statement (E2002)
  return 0;
}
```

## Guidance

If you computed a value and you want to keep it, bind it:

```silk
fn main () -> int {
  let x: int = 1 + 2;
  return x;
}
```

If you want a value for control flow, prefer an expression form that produces a
value (for example `match` expressions; see `docs/language/flow-match.md`).

## Compiler requirements

The compiler must:

- Distinguish between expressions that can appear as statements and those that cannot (if the spec imposes restrictions).
- Preserve evaluation order consistent with the language’s semantics.
