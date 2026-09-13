---
layout: "docs"
title: "Operators"
description: "Silk’s operators cover arithmetic, comparisons, logical operators, assignment, casts, ranges, optionals (?., ??), and typed-error propagation (?)."
docsCollection: "silkWiki"
section: "language"
order: 20
sourcePath: "language/operators.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Operators

Silk’s operators cover arithmetic, comparisons, logical operators, assignment,
casts, ranges, optionals (`?.`, `??`), and typed-error propagation (`?`).

This wiki page is a learning-oriented companion to the canonical reference:
[operators](/silk/wiki/language/operators/).

## Notes

- Full operator set + precedence: [operators](/silk/wiki/language/operators/)

## Syntax
```silk
let a: int = 10;
let b: int = 3;

let sum: int = a + b;
let cmp: bool = a >= b;

// Optional chaining and coalescing
// let email: string = user.profile?.email ?? "no-email";

// Casts
let x: u64 = 123 as u64;

// Typed-error propagation
// let value: T = may_panic()?;
```

## Examples

### Example: arithmetic + comparisons
```silk
fn main () -> int {
  let a: int = 10;
  let b: int = 3;
  if a % b == 1 {
    return a + b; // 13
  }
  return 0;
}
```

### Example: `??` coalescing
```silk
fn main () -> int {
  let x: int? = None;
  return x ?? 42;
}
```

## See also

- Canonical reference: [operators](/silk/wiki/language/operators/)
- Optionals: [optional](/silk/wiki/language/optional/)
- Typed errors and `?`: [typed errors](/silk/wiki/language/typed-errors/)
