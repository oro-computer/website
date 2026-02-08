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

### Works today: push/pop

```silk
import std::vector;

type Vec = std::vector::Vector(int);

fn main () -> int {
  let v_r = Vec.init(4);
  if v_r.is_err() { return 0; }
  let mut v: Vec = match (v_r) {
    Ok(v) => v,
    Err(_) => Vec.empty(),
  };
  v.push(1);
  v.push(2);
  let x: int = v.pop() ?? 0;
  v.drop();
  return x;
}
```

## See also

- Canonical doc: `docs/std/vector.md`
- Slices and iterators: `docs/std/arrays.md`, `docs/std/interfaces.md`
