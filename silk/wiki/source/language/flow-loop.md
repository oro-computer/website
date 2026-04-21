# `loop`

`loop { ... }` is an infinite loop that exits via `break` or `return`.

Canonical spec: [flow loop](?p=language/flow-loop).

## Notes

- Supported forms + tests: [flow loop](?p=language/flow-loop)

## Syntax

```silk
loop {
  // ...
}
```

## Example
```silk
fn main () -> int {
  let mut i: int = 0;
  loop {
    if i == 3 {
      break;
    }
    i += 1;
  }
  return i;
}
```

## See also

- Canonical spec: [flow loop](?p=language/flow-loop)
- `break`: [flow break](?p=language/flow-break)
