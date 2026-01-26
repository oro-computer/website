# Errors and assertions

Silk favors explicit, typed error modeling (optionals and `Result`-style return
shapes) and uses typed errors (`error`, `panic`, `T | ErrorType...`) for
unrecoverable logic bugs and contract violations.

This page focuses on assertions and the high-level model; see typed errors for
the full rules.

Canonical doc: `docs/language/errors.md`.

## Example (Works today): `assert`

```silk
fn main () -> int {
  assert (1 + 2) == 3;
  return 0;
}
```

## See also

- Canonical doc: `docs/language/errors.md`
- Typed errors: `docs/wiki/language/typed-errors.md`
- `Result(T, E)`: `docs/wiki/std/result.md`
