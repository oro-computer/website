# `loop`

`loop { ... }` is an infinite loop that exits via `break` or `return`.

[Canonical spec](../docs/?p=language/flow-loop).

## Status

- Implemented subset + tests: [loop Loop](../docs/?p=language/flow-loop)

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

- [Canonical spec](../docs/?p=language/flow-loop)
- `break`: [break](?p=language/flow-break)
