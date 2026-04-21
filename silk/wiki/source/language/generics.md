# Generics (monomorphized)

Silk generics are compile-time and monomorphized: each applied type like
`Vector(int)` produces a concrete instantiation at build time (no runtime type
parameters).

Canonical spec: [generics](?p=language/generics).

## Notes

- supported forms and restrictions: [generics](?p=language/generics)

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

- Canonical spec: [generics](?p=language/generics)
- Type forms: [types](?p=language/types)
- Std generic collections: [vector](?p=std/vector), [map](?p=std/map), [set](?p=std/set)
