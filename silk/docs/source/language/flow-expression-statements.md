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

For Silk currently, an expression statement is only valid when
the expression is either:

- a call expression (a function call), or
- an assignment / compound assignment expression.
- an increment/decrement expression (`++x`, `x++`, `--x`, `x--`).
- `await p;` where `p: Promise(void)`.
- `await * ps;` where `ps: Promise(T)[]` (the collected results are discarded).
- `yield ...;` statement forms inside `task fn` as described in
 [concurrency](?p=language/concurrency).

All other expression statements are rejected.

This restriction will be relaxed as more of the expression language is lowered
and code-generated.

Examples (accepted in the Supported forms):

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

```silk
async fn pause () -> void {}

async fn main () -> int {
  await pause();
  await * [pause()];
  return 0;
}
```

Examples (rejected in the Supported forms):

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
value (for example `match` expressions; see [flow match](?p=language/flow-match)).

## Compiler requirements

The compiler must:

- Distinguish between expressions that can appear as statements and those that cannot (if the spec imposes restrictions).
- Preserve evaluation order consistent with the language’s semantics.
