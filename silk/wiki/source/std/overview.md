# Standard library overview (`std::`)

`std::` is the Silk standard library namespace. The `docs/std/` tree specifies
the intended API and structure; an in-tree stdlib implementation exists
under `std/` for Silk currently.

Canonical doc: [overview](?p=std/overview).

## Notes

- Design + implementation: many modules have an Supported forms; the overall surface is still evolving.
- Details: [overview](?p=std/overview)

## Importing

`std::` is available to import by default in normal `silk build` workflows.

```silk
import io from "std/io";
import vector from "std/vector";
```

## Examples

### Example: a tiny “hello std” program
```silk
import io from "std/io";
import vector from "std/vector";

type VecInt = vector::Vector(int);

fn main () -> int {
  let mut v: VecInt = VecInt.init(4);
  v.push(10);
  v.push(32);

  io::println("len={d} first_pop={d}", v.len() as int, v.pop() ?? 0);
  v.drop();
  return 0;
}
```

## See also

- Canonical doc: [overview](?p=std/overview)
- Module structure and swappability: [package structure](?p=std/package-structure)
- API conventions: [conventions](?p=std/conventions)
