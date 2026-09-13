---
layout: "silkWiki-docs"
title: "Types"
description: "Silk is a statically typed language with a small set of built-in primitive types and first-class user-defined types (struct, enum, interface)."
docsCollection: "silkWiki"
section: "language"
order: 17
sourcePath: "language/types.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Types

Silk is a statically typed language with a small set of built-in primitive
types and first-class user-defined types (`struct`, `enum`, `interface`).

This wiki page is a learning-oriented companion to the canonical spec:
[types](/silk/wiki/language/types/).

## Notes

- Reference details and Limitations: [types](/silk/wiki/language/types/)

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
// (Receiver/borrow rules are in the mutability docs.)
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

- Full reference: [types](/silk/wiki/language/types/)
- Type modifiers and borrow rules: [mutability](/silk/wiki/language/mutability/)
- Generics (monomorphized): [generics](/silk/wiki/language/generics/)
