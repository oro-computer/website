# Boolean literals

Silk has the boolean type `bool` with literals `true` and `false`.

[Canonical doc](../docs/?p=language/literals-boolean).

## Example
```silk
fn main () -> int {
  let ok: bool = true;
  if ok && !false {
    return 0;
  }
  return 1;
}
```
