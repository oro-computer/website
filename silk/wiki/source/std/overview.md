# Standard library overview (`std::`)

`std::` is the Silk standard-library namespace. This wiki page is the quick
orientation layer; use the canonical docs for the full API surface, current
limits, and target-specific details.

Canonical doc: [Standard library overview](../docs/?p=std/overview).

## Status

- Hosted subsets already exist across core modules such as `std::io`,
  `std::task`, `std::sync`, `std::fs`, `std::net`, `std::tls`, and related
  packages.
- Coverage still varies by module; use the canonical docs when you need the
  exact current API or limitation for a specific package.

## Importing

`std::` is available to import by default in normal `silk build` workflows.

```silk
import std::io;
import std::vector;
```

## Examples

### Example: a tiny “hello std” program
```silk
import std::io;
import std::vector;

type VecInt = std::vector::Vector(int);

fn main () -> int {
  let mut v: VecInt = VecInt.init(4);
  v.push(10);
  v.push(32);

  std::io::println("len={d} first_pop={d}", v.len() as int, v.pop() ?? 0);
  v.drop();
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/overview)
- [Module structure and swappability](?p=std/package-structure)
- [API conventions](?p=std/conventions)
