# `std::vector`

`std::vector` provides a generic, growable owning container `Vector(T)` used
widely throughout `std::`.

Canonical doc: `docs/std/vector.md`.

## Status

- Implemented subset + design: a usable subset is implemented in `std/vector.slk`.
- Details: `docs/std/vector.md`

## Importing

```silk
import std::vector;
```

## Examples

### Example: push/pop
```silk
import std::vector;

type Vec = std::vector::Vector(int);

fn main () -> int {
  match (Vec.init(4)) {
    Ok(vec) => {
      let mut v: Vec = vec;
      v.push(1);
      v.push(2);
      let x: int = v.pop() ?? 0;
      v.drop();
      return x;
    },
    Err(_) => {
      return 0;
    },
  }
}
```

## See also

- Canonical doc: `docs/std/vector.md`
- Slices and iterators: `docs/std/arrays.md`, `docs/std/interfaces.md`
