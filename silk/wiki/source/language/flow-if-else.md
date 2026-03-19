# `if` / `else`

Use `if` / `else` for boolean branching.

`if` is available as both a statement form and the documented value-producing
expression form; see the canonical spec for the exact rules.

Canonical spec: `docs/language/flow-if-else.md`.

## Reference

- Canonical spec and current behavior: `docs/language/flow-if-else.md`

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

- Canonical spec: `docs/language/flow-if-else.md`
- `match` (expression): `docs/language/flow-match.md`
