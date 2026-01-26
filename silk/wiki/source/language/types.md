# Types

Silk is a statically typed language with a small set of built-in primitive
types and first-class user-defined types (`struct`, `enum`, `interface`).

This wiki page is a learning-oriented companion to the canonical spec:
`docs/language/types.md`.

## Status

- Implemented-subset details and current limitations: `docs/language/types.md`
- End-to-end support snapshot: `STATUS.md`

## Common Type Forms

```silk
// Primitives
let ok: bool = true;
let n: int = 42;
let x: f64 = 3.14;
let c: char = 'A';
let s: string = "hello";

// Optionals
let maybe: int? = None;

// References (borrows)
// (Receiver/borrow rules are in `docs/language/mutability.md`.)
// let r: &MyStruct = ...;

// Arrays and slices
let xs: int[3] = [1, 2, 3];
// let ys: int[] = ...;

// Function types + function values
type IntAdder = fn (int, int) -> int;
```

## Examples

### Works today: function values with an explicit function type

```silk
type IntAdder = fn (int, int) -> int;

fn main () -> int {
  let add: IntAdder = fn (x: int, y: int) -> x + y;
  return add(40, 2);
}
```

### Works today: arrays + `for` iteration

```silk
fn main () -> int {
  let xs: int[3] = [1, 2, 3];
  let mut sum: int = 0;
  for x in xs {
    sum += x;
  }
  return sum;
}
```

## See also

- Canonical spec: `docs/language/types.md`
- Type modifiers and borrow rules: `docs/language/mutability.md`
- Generics (monomorphized): `docs/language/generics.md`
