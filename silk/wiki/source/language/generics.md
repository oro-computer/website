# Generics (monomorphized)

Silk generics are compile-time and monomorphized: each applied type like
`Vector(int)` produces a concrete instantiation at build time (no runtime type
parameters).

[Canonical spec](../docs/?p=language/generics).

## Status

- Current supported forms and restrictions: [Generics (Monomorphized)](../docs/?p=language/generics)

## Syntax
```silk
struct Pair(T) {
  a: T,
  b: T,
}

impl Pair(T) {
  public fn first (self: &Pair(T)) -> T { return self.a; }
}
```

## Examples

### Example: generic struct + applied type
```silk
struct Pair(T) {
  a: T,
  b: T,
}

impl Pair(T) {
  public fn first (self: &Pair(T)) -> T { return self.a; }
}

fn main () -> int {
  let p: Pair(int) = { a: 1, b: 2 };
  return p.first();
}
```

## See also

- [Canonical spec](../docs/?p=language/generics)
- Type forms: [Types](../docs/?p=language/types)
- Std generic collections: [std::vector](../docs/?p=std/vector), [std::map — Maps and Dictionaries](../docs/?p=std/map), [std::set — Sets](../docs/?p=std/set)
