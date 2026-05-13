# Errors and assertions

Silk favors explicit, typed error modeling (optionals and `Result`-style return
shapes) and uses typed errors (`error`, `panic`, `T | ErrorType...`) for
unrecoverable logic bugs and contract violations.

This page focuses on assertions and the high-level model; see typed errors for
the full rules.

Reference: [errors](../docs/?p=language/errors).

## Recoverable Errors

Use ordinary values for conditions callers can reasonably handle:

```silk
fn parse_port (text: string) -> Result(int, string) {
  if text == "" {
    return Err("missing port");
  }
  return Ok(8080);
}
```

`Result(T, E)` keeps the success and failure cases visible in the type.
Optionals (`T?`) are useful when absence is the whole error.

## Example: `assert`

```silk
fn main () -> int {
  assert (1 + 2) == 3;
  return 0;
}
```

Assertions are for facts that should be impossible to violate. In test builds,
assertion failures are reported as test failures. In normal executable builds,
a failed assertion is a program failure.

## Typed Errors

Typed errors model unrecoverable violations with explicit error declarations and
`panic`:

```silk
error OutOfBounds {
  index: int,
  len: int,
}

fn at (xs: int[], index: int) -> int | OutOfBounds {
  if index < 0 {
    panic OutOfBounds{ index, len: 0 };
  }
  return xs[index];
}
```

Use typed errors when the failure represents a broken contract or logic error,
not routine user input.

## Choosing A Shape

- Use `T?` when absence is the only failure information.
- Use `Result(T, E)` for recoverable domain failures.
- Use typed errors for contract violations.
- Use `assert` for local facts that should always hold.

## See also

- Reference: [errors](../docs/?p=language/errors)
- Typed errors: [typed errors](?p=language/typed-errors)
- `Result(T, E)`: [result](?p=std/result)
- Testing: [testing](?p=language/testing)
