---
layout: "docs"
title: "Typed errors (error, panic, and T | ErrorType...)"
description: "Typed errors make “this function can fail” explicit in the type system:"
docsCollection: "silkWiki"
section: "language"
order: 34
sourcePath: "language/typed-errors.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Typed errors (`error`, `panic`, and `T | ErrorType...`)

Typed errors make “this function can fail” explicit in the type system:

- define `error` types,
- declare error contracts in function return types (`T | MyError`),
- trigger errors with `panic MyError { ... };`,
- handle them with `match (expr) { ... }` (statement form + Terminal Arm Rule),
- and propagate them with the postfix `?` operator (`call()?`).

Full reference: [typed errors](/silk/wiki/language/typed-errors/).

## Notes

Defined in the reference compiler (front-end + native backend subset).

- Canonical spec + rules: [typed errors](/silk/wiki/language/typed-errors/)
- Error model overview: [errors](/silk/wiki/language/errors/)

## Syntax
```silk
error OutOfBounds { index: int, len: int }

fn get_at (xs: &u8[], index: int) -> u8 | OutOfBounds {
  if index < 0 { panic OutOfBounds{ index: index, len: 0 }; }
  return 0;
}

fn caller (xs: &u8[]) -> u8 | OutOfBounds {
  let x: u8 = get_at(xs, 0)?;
  return x;
}
```

## Examples

### Example: `?` propagation
```silk
error Boom { code: int }

fn may_boom () -> int | Boom {
  panic Boom{ code: 7 };
}

fn main () -> int | Boom {
  let x: int = may_boom()?;
  return x;
}
```

### Example: handling with [`match`](/silk/wiki/language/flow-match/) statement
```silk
error Boom { code: int }

fn may_boom (x: int) -> int | Boom {
  if x == 0 {
    panic Boom{ code: 123 };
  }
  return 7;
}

fn main () -> int {
  match (may_boom(0)) {
    value => {
      return value;
    },
    err: Boom => {
      std::abort();
    },
  }
}
```

## See also

- Full reference: [typed errors](/silk/wiki/language/typed-errors/)
