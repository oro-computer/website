# `while`

Use `while` for condition-controlled looping.

[Canonical spec](../docs/?p=language/flow-while).

## Status

- Implemented subset + tests: [while Loop](../docs/?p=language/flow-while)

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

- [Canonical spec](../docs/?p=language/flow-while)
- `break` / `continue`: [break](?p=language/flow-break), [continue](?p=language/flow-continue)
