# Standard library overview (`std::`)

`std::` is the Silk standard library namespace. The `docs/std/` tree is the
canonical reference, and the compiler repository ships the corresponding
modules under `std/`.

Full reference: `docs/std/overview.md`.

## Notes

- Full reference: `docs/std/overview.md`

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

- Canonical doc: `docs/std/overview.md`
- Module structure and swappability: `docs/wiki/std/package-structure.md`
- API conventions: `docs/wiki/std/conventions.md`
