# `while`

Use `while` for condition-controlled looping.

Canonical spec: [flow while](?p=language/flow-while).

## Notes

- Supported forms + tests: [flow while](?p=language/flow-while)

## Syntax

```silk
while condition {
  // ...
}
```

## Example
```silk
fn main () -> int {
  let mut i: int = 0;
  let mut sum: int = 0;

  while i < 3 {
    sum += i;
    i += 1;
  }

  return sum; // 0 + 1 + 2 = 3
}
```

## See also

- Canonical spec: [flow while](?p=language/flow-while)
- `break` / `continue`: [flow break](?p=language/flow-break), [flow continue](?p=language/flow-continue)
