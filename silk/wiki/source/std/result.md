# `std::result`

`std::result` standardizes the common “success or error” return shape as
`Result(T, E)` so APIs across `std::` compose cleanly.

Canonical doc: [result](?p=std/result).

## Notes

- Implemented (current representation is a tagged union enum).
- Details: [result](?p=std/result)
- `Result` is available without an import through the std prelude module
 `std::runtime::globals`.

## Importing

No import is needed to use `Result(T, E)` in normal user code. If you need to
refer to the defining module itself, use a module-specifier import such as
`import result from "std/result";`.

## Examples

### Example: create and inspect a `Result`
```silk
type R = Result(int, string);

fn main () -> int {
  let check: R = R.ok(123);
  match (check) {
    Err(_) => {
      return 1;
    },
  }

  let value: int = R.ok(123) ?? 0;
  if value != 123 { return 2; }
  return 0;
}
```

## See also

- Canonical doc: [result](?p=std/result)
- Error model: [errors](?p=language/errors), [typed errors](?p=language/typed-errors)
