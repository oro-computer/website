# `return`

Use `return` to exit the current function.

Canonical spec: `docs/language/flow-return.md`.

## Status

- Implemented subset + diagnostics: `docs/language/flow-return.md`

## Syntax

```silk
return;
return expr;
```

## Example (Works today)

```silk
fn add1 (x: int) -> int {
  return x + 1;
}

fn main () -> int {
  return add1(41);
}
```

## See also

- Canonical spec: `docs/language/flow-return.md`
- `test` blocks allow `return;`: `docs/wiki/language/testing.md`
