# Generics (monomorphized)

Silk generics are compile-time and monomorphized: each applied type like
`Vector(int)` produces a concrete instantiation at build time (no runtime type
parameters).

Canonical spec: `docs/language/generics.md`.

## Status

- Current supported forms and restrictions: `docs/language/generics.md`

## Syntax (Selected)

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

### Works today: generic struct + applied type

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

- Canonical spec: `docs/language/generics.md`
- Type forms: `docs/language/types.md`
- Std generic collections: `docs/std/vector.md`, `docs/std/map.md`, `docs/std/set.md`
