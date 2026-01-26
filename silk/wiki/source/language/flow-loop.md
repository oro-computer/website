# `loop`

`loop { ... }` is an infinite loop that exits via `break` or `return`.

Canonical spec: `docs/language/flow-loop.md`.

## Status

- Implemented subset + tests: `docs/language/flow-loop.md`
- End-to-end support snapshot: `STATUS.md`

## Syntax

```silk
loop {
  // ...
}
```

## Example (Works today)

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

- Canonical spec: `docs/language/flow-loop.md`
- `break`: `docs/wiki/language/flow-break.md`
