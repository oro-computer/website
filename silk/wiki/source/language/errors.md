# Errors and assertions

Silk favors explicit, typed error modeling (optionals and `Result`-style return
shapes) and uses typed errors (`error`, `panic`, `T | ErrorType...`) for
unrecoverable logic bugs and contract violations.

This page focuses on assertions and the high-level model; see typed errors for
the full rules.

Canonical doc: [errors](?p=language/errors).

## Example: `assert`
```silk
fn main () -> int {
  assert (1 + 2) == 3;
  return 0;
}
```

## See also

- Canonical doc: [errors](?p=language/errors)
- Typed errors: [typed errors](?p=language/typed-errors)
- `Result(T, E)`: [result](?p=std/result)
