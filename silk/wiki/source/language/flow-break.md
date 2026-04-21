# `break`

`break;` exits the nearest enclosing loop.

Canonical spec: [flow break](?p=language/flow-break).

## Notes

- Supported forms + diagnostics: [flow break](?p=language/flow-break)

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

- Canonical spec: [flow break](?p=language/flow-break)
- `continue`: [flow continue](?p=language/flow-continue)
