---
layout: "docs"
title: "Structs and impl"
description: "struct is Silk’s primary record type: named fields stored together as one value. impl blocks attach methods (and special methods like constructor and drop) to a type."
docsCollection: "silkWiki"
section: "language"
order: 29
sourcePath: "language/structs-impls-layout.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Structs and `impl`

`struct` is Silk’s primary record type: named fields stored together as one
value. `impl` blocks attach methods (and special methods like `constructor`
and `drop`) to a type.

Full reference: [structs impls layout](/silk/wiki/language/structs-impls-layout/).

## Notes

- Supported forms + layout model: [structs impls layout](/silk/wiki/language/structs-impls-layout/)

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

- Full reference: [structs impls layout](/silk/wiki/language/structs-impls-layout/)
- Mutability and `mut &T`: [mutability](/silk/wiki/language/mutability/)
- Enums and matching: [enums](/silk/wiki/language/enums/), [flow match](/silk/wiki/language/flow-match/)
