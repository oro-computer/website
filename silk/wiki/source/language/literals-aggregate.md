# Aggregate literals (arrays and structs)

Aggregate literals build compound values directly in source code:

- array literals: `[a, b, c]`
- struct literals: `Type{ field: value, ... }`

Canonical doc: [literals aggregate](?p=language/literals-aggregate).

## Example
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

- Canonical doc: [literals aggregate](?p=language/literals-aggregate)
- Types: [types](?p=language/types)
