# Refinement Types (Removed)

Silk previously had an experimental refinement-type design: types annotated with
logical predicates, often written in a `where`-style form.

That design has been removed.

Silk now uses a clearer split:

- **Formal Silk** for proof obligations and value predicates,
- **const parameters / dependent-type-like syntax** for compile-time shape.

## What to use instead

### Function preconditions and postconditions

Use `#require` and `#assure` when the rule belongs to an operation:

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

### Type-level invariants

Use `#require` on a `struct` when the invariant belongs to the value itself:

```silk
#require len >= 0;
#require cap >= len;
struct BufferState {
  ptr: u64,
  len: int,
  cap: int,
}
```

This is the replacement for the old “refined record” use case.

### Local proof points

Use `#assert` when the fact matters only at one spot in the code:

```silk
fn main () -> int {
  let used: int = 4;
  let total: int = 8;
  #assert used <= total;
  return total - used;
}
```

### Reusable proof bundles

Use `theory` / `#theory` when the same proof shape appears in multiple places:

```silk
export theory bounded_window (offset: int, size: int, total: int) {
  #require offset >= 0;
  #require size >= 0;
  #assure offset + size <= total;
}
```

### Compile-time shape

If the property is “this type carries a compile-time size/capacity/width,” use
const parameters rather than a refinement predicate:

```silk
struct Digest(N: usize) {
  bytes: u8[N],
}
```

See [`Dependent Types`](?p=language/dependent-types).

## Old refinement-type intent → current Silk surface

- `PositiveInt where x > 0`
  - use a function `#require x > 0`, or a `struct` requirement when it belongs
    to a nominal type
- `Buffer where len <= cap`
  - use `#require` on the `struct`
- `Result where predicate(result)`
  - use `#assure`
- repeated proof rule used in many functions
  - use `theory`
- compile-time-sized collection
  - use const parameters / applied types

## Why this is better downstream

This split keeps the language easier to read:

- types describe runtime representation and compile-time shape,
- Formal Silk describes proof obligations,
- and the verifier reasons about those obligations without inventing a second
  predicate-bearing type language.

## See also

- [`Formal Silk`](?p=language/formal-verification)
- [`Formal Silk guide`](?p=guides/formal-silk)
- [`Struct Requirements`](?p=language/struct-requirements)
- [`Dependent Types`](?p=language/dependent-types)
