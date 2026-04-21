# Structs and `impl`

`struct` is Silk’s primary record type: named fields stored together as one
value. `impl` blocks attach methods (and special methods like `constructor`
and `drop`) to a type.

Canonical spec: [structs impls layout](?p=language/structs-impls-layout).

## Notes

- Supported forms + layout model: [structs impls layout](?p=language/structs-impls-layout)

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

### Example: struct literal + method call
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

- Canonical spec: [structs impls layout](?p=language/structs-impls-layout)
- Mutability and `mut &T`: [mutability](?p=language/mutability)
- Enums and matching: [enums](?p=language/enums), [flow match](?p=language/flow-match)
