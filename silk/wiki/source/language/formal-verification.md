# Formal verification (Formal Silk)

Silk includes syntax for writing contracts and verification metadata:

- `#require` / `#assure` for pre/postconditions
- `#assert` for local assertions
- `#invariant` / `#variant` for loops

Canonical doc: `docs/language/formal-verification.md`.

## Example (Design / verifier-oriented)

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

## See also

- Canonical doc: `docs/language/formal-verification.md`
