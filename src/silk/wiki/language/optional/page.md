---
layout: "silkWiki-docs"
title: "Optionals (T?)"
description: "Optionals represent “maybe a value” without sentinel nulls."
docsCollection: "silkWiki"
section: "language"
order: 18
sourcePath: "language/optional.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Optionals (`T?`)

Optionals represent “maybe a value” without sentinel `null`s.

- The nominal form is `Option(T)`.
- The idiomatic form is suffix `T?`.
- Values are `None` (empty) or `Some(value)` (present).
- Use `??` (coalescing), `?.` (optional field access), and [`match`](/silk/wiki/language/flow-match/) to consume
 optionals.

Full reference: [optional](/silk/wiki/language/optional/).

## Notes

- Supported forms + backend payload limits: [optional](/silk/wiki/language/optional/)

## Syntax
```silk
let a: int? = None;
let b: int? = Some(123);

let x: int = b ?? 0;
let y: int = match b {
  None => 0,
  Some(v) => v,
};
```

## Examples

### Example: `??` and [`match`](/silk/wiki/language/flow-match/)
```silk
fn main () -> int {
  let x: int? = Some(7);
  let y: int = x ?? 0;
  let z: int = match x {
    None => 1,
    Some(v) => v,
  };
  return y + z;
}
```

### Example: optional struct field access with `?.`
```silk
struct Profile {
  email: string,
}

struct User {
  profile: Profile?,
}

fn main () -> int {
  let u: User = User{ profile: Some(Profile{ email: "a@b" }) };
  let email: string = u.profile?.email ?? "no-email";
  if email == "a@b" {
    return 0;
  }
  return 1;
}
```

## See also

- Full reference: [optional](/silk/wiki/language/optional/)
- [`match`](/silk/wiki/language/flow-match/) expressions: [flow match](/silk/wiki/language/flow-match/)
