# Standard library overview (`std::`)

`std::` is the Silk standard library namespace. Start here when you want the top-level map of shipped modules, then move into the exact module pages for the surface you are using.

Canonical doc: [overview](?p=std/overview).

## Notes

- Use [overview](?p=std/overview) for the complete standard-library map and module descriptions.
- Use [module catalog](../docs/?p=std/module-catalog) when you need an audit-style inventory of what ships in the toolchain.

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

- Canonical doc: [overview](?p=std/overview)
- Module structure and swappability: [package structure](?p=std/package-structure)
- API conventions: [conventions](?p=std/conventions)
