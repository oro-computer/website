# Types

Silk is a statically typed language with a small set of built-in primitive
types and first-class user-defined types (`struct`, `enum`, `interface`).

This wiki page is a learning-oriented companion to the canonical spec:
[`/silk/docs/?p=language/types`](/silk/docs/?p=language/types).

## Status

- Implemented-subset details and active boundaries:
  [`/silk/docs/?p=language/types`](/silk/docs/?p=language/types)

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
// (Receiver/borrow rules are in `/silk/docs/?p=language/mutability`.)
// let r: &MyStruct = ...;

// Arrays and slices
let xs: int[3] = [1, 2, 3];
// let ys: int[] = ...;

// Function types + function values
type IntAdder = fn (int, int) -> int;
```

## Examples

### Example: function values with an explicit function type
```silk
type IntAdder = fn (int, int) -> int;

fn main () -> int {
  let add: IntAdder = fn (x: int, y: int) -> x + y;
  return add(40, 2);
}
```

### Example: arrays + `for` iteration
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

- Canonical doc: [`/silk/docs/?p=language/types`](/silk/docs/?p=language/types)
- Type modifiers and borrow rules: [`/silk/docs/?p=language/mutability`](/silk/docs/?p=language/mutability)
- Generics (monomorphized): [`/silk/docs/?p=language/generics`](/silk/docs/?p=language/generics)
