# `return`

Use `return` to exit the current function.

Full reference: `docs/language/flow-return.md`.

## Notes

- Full reference: `docs/language/flow-return.md`

## Syntax

```silk
return;
return expr;
```

## Example
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
