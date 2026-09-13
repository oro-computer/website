---
layout: "silkWiki-docs"
title: "Interfaces"
description: "Interfaces declare method signatures that types (or modules) can conform to via impl ... as ... (or module ... as ...). This is the basis for protocol-like surfaces such as iterators and Drop."
docsCollection: "silkWiki"
section: "language"
order: 31
sourcePath: "language/interfaces.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Interfaces

Interfaces declare method signatures that types (or modules) can conform to via
`impl ... as ...` (or `module ... as ...`). This is the basis for protocol-like
surfaces such as iterators and Drop.

Full reference: [interfaces](/silk/wiki/language/interfaces/).

## Notes

- Full reference: [interfaces](/silk/wiki/language/interfaces/)
- Dynamic dispatch (trait objects/vtables): not implemented yet

## Syntax
```silk
interface Len {
  fn len() -> i64;
}

struct Counter {
  n: i64,
}

impl Counter as Len {
  fn len (self: &Counter) -> i64 { return self.n; }
}
```

## Examples

### Example: conformance + direct method call
```silk
interface Len {
  fn len() -> i64;
}

struct Counter {
  n: i64,
}

impl Counter as Len {
  fn len (self: &Counter) -> i64 { return self.n; }
}

fn main () -> int {
  let c: Counter = Counter{ n: 3 };
  return c.len() as int;
}
```

## See also

- Full reference: [interfaces](/silk/wiki/language/interfaces/)
- Std protocols: [interfaces](/silk/wiki/std/interfaces/)
