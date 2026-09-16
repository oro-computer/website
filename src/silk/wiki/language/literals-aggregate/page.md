---
layout: "docs"
description: "Aggregate literals build compound values directly in source code:"
docsCollection: "silkWiki"
section: "language"
order: 28
sourcePath: "language/literals-aggregate.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Aggregate literals (arrays and structs)

Aggregate literals build compound values directly in source code:

- array literals: `[a, b, c]`
- struct literals: `Type{ field: value, ... }`

Full reference: [literals aggregate](/silk/wiki/language/literals-aggregate/).

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

- Full reference: [literals aggregate](/silk/wiki/language/literals-aggregate/)
- Types: [types](/silk/wiki/language/types/)
