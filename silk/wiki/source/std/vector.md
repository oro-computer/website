# `std::vector`

`std::vector` provides a generic, growable owning container `Vector(T)` used
widely throughout `std::`.

[Canonical doc](../docs/?p=std/vector).

## Status

- Implemented subset + design: a usable subset is implemented today.
- [Details](../docs/?p=std/vector)

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
  let mut v = match Vec.init(4) {
    Ok(v) => v,
    Err(_) => return 0,
  };
  v.push(1);
  v.push(2);
  let x: int = v.pop() ?? 0;
  v.drop();
  return x;
}
```

## See also

- [Canonical doc](../docs/?p=std/vector)
- Slices and iterators: [std::arrays](../docs/?p=std/arrays), [std::interfaces](../docs/?p=std/interfaces)
