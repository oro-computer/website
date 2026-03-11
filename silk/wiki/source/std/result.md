# `std::result`

`std::result` standardizes the common “success or error” return shape as
`Result(T, E)` so APIs across `std::` compose cleanly.

[Canonical doc](../docs/?p=std/result).

## Status

- Implemented (current representation is a tagged union enum).
- [Details](../docs/?p=std/result)

## Importing

```silk
import std::result;
```

## Examples

### Example: create and inspect a `Result`
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

- [Canonical doc](../docs/?p=std/result)
- Error model: [Errors](../docs/?p=language/errors), [Typed Errors (error, panic, and T | ErrorType...)](../docs/?p=language/typed-errors)
