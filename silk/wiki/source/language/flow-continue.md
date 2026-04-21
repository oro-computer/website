# `continue`

`continue;` skips the remainder of the current loop body and advances to the
next iteration.

Canonical spec: [flow continue](?p=language/flow-continue).

## Notes

- Supported forms + diagnostics: [flow continue](?p=language/flow-continue)

## Syntax

```silk
continue;
```

## Example
```silk
fn main () -> int {
  let mut sum: int = 0;
  for i in 0..5 {
    if i == 3 {
      continue;
    }
    sum += i;
  }
  return sum; // 0 + 1 + 2 + 4 = 7
}
```

## See also

- Canonical spec: [flow continue](?p=language/flow-continue)
- `break`: [flow break](?p=language/flow-break)
