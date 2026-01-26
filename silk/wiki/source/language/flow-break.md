# `break`

`break;` exits the nearest enclosing loop.

Canonical spec: `docs/language/flow-break.md`.

## Status

- Implemented subset + diagnostics: `docs/language/flow-break.md`
- End-to-end support snapshot: `STATUS.md`

## Syntax

```silk
break;
```

## Example (Works today)

```silk
fn main () -> int {
  let mut i: int = 0;
  while true {
    i += 1;
    if i == 3 {
      break;
    }
  }
  return i;
}
```

## See also

- Canonical spec: `docs/language/flow-break.md`
- `continue`: `docs/wiki/language/flow-continue.md`
