# Numeric literals

Silk supports integer and floating-point literals, including base prefixes and
suffixes as defined in the canonical spec.

Canonical doc: `docs/language/literals-numeric.md`.

## Example (Works today)

```silk
fn main () -> int {
  let a: int = 42;
  let b: u64 = 0xff as u64;
  let c: f64 = 1.5;
  if a + (b as int) > 0 && c > 0.0 {
    return 0;
  }
  return 1;
}
```

## See also

- Canonical doc: `docs/language/literals-numeric.md`
- Operators: `docs/wiki/language/operators.md`
