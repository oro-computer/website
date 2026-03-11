# `break`

`break;` exits the nearest enclosing loop.

[Canonical spec](../docs/?p=language/flow-break).

## Status

- Implemented subset + diagnostics: [break](../docs/?p=language/flow-break)

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

- [Canonical spec](../docs/?p=language/flow-break)
- `continue`: [continue](?p=language/flow-continue)
