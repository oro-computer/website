# Tutorial 3: Arrays and Slices

This tutorial covers:

- fixed arrays `T[N]`,
- slices `T[]`,
- array literals `[a, b, c]` and empty literals `[]` with expected types,
- indexing (`xs[i]`) and indexed assignment (`xs[i] = v`, `xs[i] += v`).

For the precise rules, see:

- `Aggregate literals (arrays and structs)` (sidebar → language),
- `Types` (sidebar → language).

## 1) Fixed arrays (`T[N]`)

```silk
fn main () -> int {
  let mut xs: int[3] = [1, 2, 3];

  xs[1] = 9;
  xs[1] += 1;

  if xs[1] != 10 { return 1; }
  return 0;
}
```

Notes:

- Array lengths are part of the type: `int[3]` is distinct from `int[4]`.
- Indexing is explicit (`xs[i]`). Keep indices in range; out-of-bounds behavior is not something you want to depend on.

## 2) Slices (`T[]`)

Slices are a “view” type: `T[]` represents a sequence of `T` values without baking a fixed length into the type.

```silk
fn main () -> int {
  let mut s: int[] = [10, 20, 30];
  s[2] = 5;
  if s[2] != 5 { return 1; }
  return 0;
}
```

## 3) Empty literals (with expected types)

Empty array literals require an expected type:

```silk
struct HasSlice {
  xs: int[],
}

fn main () -> int {
  let empty_fixed: int[0] = [];
  let empty_slice: int[] = [];
  let _hs = HasSlice{ xs: [] };
  return 0;
}
```

This rule keeps `[]` unambiguous: the compiler needs to know what element type you meant.
