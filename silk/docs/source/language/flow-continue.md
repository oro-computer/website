# `continue`

`continue` skips the remainder of the current loop iteration and jumps to the
next iteration of the nearest enclosing loop.

## Surface Syntax

```silk
continue;
```

Notes:

- `continue` is a statement, terminated by a semicolon.

## Semantics

When executed inside a loop body, `continue;`:

- stops executing the remainder of the current iteration’s body, and
- transfers control to the loop’s “next iteration” point:
  - for `loop`, this means jumping to the start of the loop body.
  - for `while`, this means re-evaluating the loop condition.
  - for `for`, this means advancing to the next iteration (and for C-style `for`
    loops, executing the loop step before re-checking the loop condition).

Example:

```silk
fn main () -> int {
  let mut i: int = 0;
  while i < 10 {
    i += 1;
    if i == 5 {
      continue; // skips the return below for i == 5
    }
    // More work could happen here.
  }
  return 0;
}
```

In nested loops, `continue` applies to the nearest loop:

```silk
fn main () -> int {
  while true {
    while true {
      continue; // continues the inner loop
    }
  }
  return 0;
}
```

## Type Checking Rules

- `continue` is only permitted inside a loop body.
- A `continue` outside a loop is a type-check error (`docs/compiler/diagnostics.md`,
  `E2008`).

## Notes

- `continue;` is valid inside `loop`, `while`, and `for`.
- `continue;` outside a loop is rejected with `E2008`.

## Common Pitfalls

- Forgetting the semicolon (`continue` is a statement).
- Expecting `continue` to exit the loop (it does not; use `break`).
- Using `continue` outside a loop (rejected, `E2008`).
