# `break`

`break` exits the nearest enclosing loop.

## Surface Syntax

```silk
break;
```

Notes:

- `break` is a statement, terminated by a semicolon.
- `break` does not carry a value in the current language design; there is no
  `break <expr>` form.

## Semantics

When executed, `break;`:

- terminates the innermost enclosing loop (`loop`, `while`, or `for`), and
- continues execution at the statement immediately following that loop.

In nested loops, `break` only exits the nearest loop:

```silk
fn main () -> int {
  while true {
    while true {
      break; // exits the inner loop only
    }
    break; // exits the outer loop
  }
  return 0;
}
```

`break` does not exit the current function. Use `return` for that.

## Type Checking Rules

- `break` is only permitted inside a loop body.
- A `break` outside a loop is a type-check error (`docs/compiler/diagnostics.md`,
  `E2007`).

## Implementation Status (Current Compiler Subset)

Implemented:

- `break;` is accepted inside loops (`loop`, `while`, and `for`) and lowered
  end-to-end.
- `break;` outside of a loop is rejected (`E2007`).

Examples that exercise the implemented subset:

- `tests/silk/pass_loop_basic.slk`
- `tests/silk/pass_while_bool.slk`
- `tests/silk/pass_for_continue_break.slk`
- `tests/silk/fail_break_outside.slk`
- `tests/silk/pass_invariant_while.slk` (shows `break` in a loop with specs)

## Common Pitfalls

- Forgetting the semicolon (`break` is a statement).
- Expecting `break` to return a value (not supported).
- Using `break` outside a loop (rejected, `E2007`).
