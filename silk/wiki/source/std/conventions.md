# `std::` conventions

`std::` modules follow shared conventions for naming, ownership/allocation,
error reporting.

Canonical doc: [conventions](?p=std/conventions).

## Notes

- Design document: use as a guideline for new `std::` APIs.
- Details: [conventions](?p=std/conventions)

## Key conventions

- **Naming**: packages are `std::area`; types are `PascalCase`; functions/methods are `snake_case`.
- **Ownership**: allocating APIs return owned containers (for example `std::strings::String`) and callers drop them.
- **Errors**:
 - use `T?` for “absence” (`None`) without extra error information,
 - use typed errors (`T | SomeError`) for recoverable runtime errors with meaning,
 - use `std::result::Result(T, E)` when callers need to distinguish multiple error causes and propagate them cleanly.

## Examples

### Example: optionals + typed errors + dropping owned values
```silk
import std::process;
import std::strings;

fn main () -> int {
  // Optional: `T?` indicates a value may be absent.
  let missing: int? = None;
  let v: int = missing ?? 123;
  if v != 123 { return 1; }

  // Typed errors: handle `T | E` with `match`.
  let mut cwd: std::strings::String = std::strings::String.empty();
  match (std::process::getcwd()) {
    s => { cwd = s; },
    _: std::process::GetCwdFailed => { return 2; },
  }

  // Owned std values are explicitly dropped in the current subset.
  cwd.drop();
  return 0;
}
```

## See also

- Canonical doc: [conventions](?p=std/conventions)
- Typed errors: [typed errors](?p=language/typed-errors)
