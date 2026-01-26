# `std::result`

`std::result` standardizes the common “success or error” return shape as
`Result(T, E)` so APIs across `std::` compose cleanly.

Canonical doc: `docs/std/result.md`.

## Status

- Implemented (current representation is a tagged union enum).
- Details: `docs/std/result.md` and `STATUS.md`

## Importing

```silk
import std::result;
```

## Examples

### Works today: create and inspect a `Result`

```silk
import std::result;

type R = std::result::Result(int, string);

fn main () -> int {
  let x: R = R.ok(123);
  if x.is_err() { return 1; }
  if R.unwrap_or(x, 0) != 123 { return 2; }
  return 0;
}
```

## See also

- Canonical doc: `docs/std/result.md`
- Error model: `docs/language/errors.md`, `docs/language/typed-errors.md`
