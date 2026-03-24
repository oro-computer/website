# `continue`

`continue;` skips the remainder of the current loop body and advances to the
next iteration.

Full reference: `docs/language/flow-continue.md`.

## Notes

- Full reference: `docs/language/flow-continue.md`

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

- Canonical spec: `docs/language/flow-continue.md`
- `break`: `docs/wiki/language/flow-break.md`
