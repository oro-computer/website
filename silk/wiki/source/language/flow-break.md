# `break`

`break;` exits the nearest enclosing loop.

Full reference: `docs/language/flow-break.md`.

## Notes

- Full reference: `docs/language/flow-break.md`

## Syntax

```silk
break;
```

## Example
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
