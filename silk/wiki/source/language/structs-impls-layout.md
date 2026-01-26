# Structs and `impl`

`struct` is Silk’s primary record type: named fields stored together as one
value. `impl` blocks attach methods (and special methods like `constructor`
and `drop`) to a type.

Canonical spec: `docs/language/structs-impls-layout.md`.

## Status

- Implemented subset + layout model: `docs/language/structs-impls-layout.md`
- End-to-end support snapshot: `STATUS.md`

## Syntax

```silk
struct Point {
  x: int,
  y: int,
}

impl Point {
  public fn sum (self: &Point) -> int {
    return self.x + self.y;
  }
}
```

## Examples

### Works today: struct literal + method call

```silk
struct Point {
  x: int,
  y: int,
}

impl Point {
  public fn add (self: &Point, other: Point) -> Point {
    return Point{
      x: self.x + other.x,
      y: self.y + other.y,
    };
  }
}

fn main () -> int {
  let p: Point = Point{ x: 1, y: 2 };
  let q: Point = Point{ x: 3, y: 4 };
  let r: Point = p.add(q);
  return r.x + r.y; // 10
}
```

## See also

- Canonical spec: `docs/language/structs-impls-layout.md`
- Mutability and `mut &T`: `docs/language/mutability.md`
- Enums and matching: `docs/language/enums.md`, `docs/language/flow-match.md`
