# Aggregate literals (arrays and structs)

Aggregate literals build compound values directly in source code:

- array literals: `[a, b, c]`
- struct literals: `Type{ field: value, ... }`

Canonical doc: `docs/language/literals-aggregate.md`.

## Example (Works today)

```silk
struct Pair {
 a: int,
 b: int,
}

fn main () -> int {
 let xs: int[3] = [1, 2, 3];
 let p: Pair = Pair{ a: xs[0], b: xs[2] };
 return p.a + p.b;
}
```

## See also

- Canonical doc: `docs/language/literals-aggregate.md`
- Types: `docs/wiki/language/types.md`
