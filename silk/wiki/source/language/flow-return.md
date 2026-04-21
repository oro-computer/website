# `return`

Use `return` to exit the current function.

Canonical spec: [flow return](?p=language/flow-return).

## Notes

- Supported forms + diagnostics: [flow return](?p=language/flow-return)

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

- Canonical spec: [flow return](?p=language/flow-return)
- `test` blocks allow `return;`: [testing](?p=language/testing)
