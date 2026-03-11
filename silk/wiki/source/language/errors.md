# Errors and assertions

Silk favors explicit, typed error modeling (optionals and `Result`-style return
shapes) and uses typed errors (`error`, `panic`, `T | ErrorType...`) for
unrecoverable logic bugs and contract violations.

This page focuses on assertions and the high-level model; see typed errors for
the full rules.

[Canonical doc](../docs/?p=language/errors).

In the current toolchain, failed assertions inside `silk test` are isolated per
test process, so one crashing test does not abort the whole test suite. Outside
`silk test`, failed assertions still abort the current program.

## Example: `assert`
```silk
fn main () -> int {
  assert (1 + 2) == 3;
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=language/errors)
- [Typed errors](?p=language/typed-errors)
- [`Result(T, E)`](?p=std/result)
