# `if` / `else`

Use `if` / `else` for boolean branching.

In the current compiler subset, `if` is a statement that chooses which block
executes. The broader language design includes expression-oriented forms; see
the canonical spec for details.

[Canonical spec](../docs/?p=language/flow-if-else).

## Status

- Implemented subset + tests: [if / else](../docs/?p=language/flow-if-else)

## Syntax

```silk
if condition {
  // ...
} else {
  // ...
}
```

## Examples

### Example: minimal `if` / `else`
```silk
fn main () -> int {
  if true {
    return 0;
  } else {
    return 1;
  }
}
```

### Example: `else if` chains
Currently, `else if` parses as sugar for a nested `if` in
the `else` branch.

```silk
fn main () -> int {
  let x: int = 1;
  if x == 0 {
    return 0;
  } else if x == 1 {
    return 1;
  } else {
    return 2;
  }
}
```

## See also

- [Canonical spec](../docs/?p=language/flow-if-else)
- `match` (expression): [match Expression (and Statement)](../docs/?p=language/flow-match)
