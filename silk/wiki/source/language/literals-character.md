# Character literals

`char` represents a Unicode scalar value. Character literals write a `char`
value directly in source code.

Canonical doc: `docs/language/literals-character.md`.

## Example (Works today)

```silk
fn main () -> int {
  let a: char = 'A';
  let nl: char = '\\n';
  if a != 'A' { return 1; }
  if nl != '\\n' { return 2; }
  return 0;
}
```

## See also

- Canonical doc: `docs/language/literals-character.md`
