# `return`

The `return` statement exits a function, optionally with a value.

## Surface Syntax

Return a value:

```silk
return <expr>;
```

Return from a `void` function:

```silk
return;
```

## Semantics

When a `return` statement executes:

- the current function terminates immediately, and
- control transfers back to the caller,
- carrying a return value if the function’s result type is non-`void`.

No statements after a `return` in the same control-flow path are executed.

## Type Checking Rules

The checker enforces:

- `return` is only valid inside a function body (otherwise `E2009`).
- In a function with non-`void` result type `R`, `return` must provide an
  expression whose type is `R` (otherwise `E2009`).
- In a `void` function, `return;` is permitted and `return <expr>;` is rejected
  (`E2009`).
- In a function with non-`void` result, falling off the end of the function
  body is a compile-time error (`docs/compiler/diagnostics.md`, `E2010`).

## Examples

### Returning from `main`

```silk
fn main () -> int {
  return 0;
}
```

### Early return

```silk
fn main () -> int {
  let x: int = 1;
  if x == 0 {
    return 0;
  }
  return 1;
}
```

### `return;` in a `void` function

```silk
struct Counter {
  value: int,
}

impl Counter {
  fn inc (mut self: &Counter) -> void {
    self.value += 1;
    return;
  }
}
```

## Implementation Status (Current Compiler Subset)

Implemented end-to-end:

- `return <expr>;` from non-`void` functions, with type checking.
- `return;` from `void` functions.
- Missing return in a non-`void` function is rejected (`E2010`).

Examples that exercise the implemented subset:

- `tests/silk/fail_return_type.slk` (wrong type, rejected)
- `tests/silk/fail_missing_return.slk` (missing return, rejected)
- `tests/silk/pass_impl_methods.slk` (uses `return;` in a `-> void` method)
