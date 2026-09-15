---
layout: "docs"
description: "Silk’s long-term design includes a borrow-checker-style static safety layer over references and mutation. Silk currently enforces a simpler, explicit mut borrow contract (see mutability)."
docsCollection: "silkWiki"
section: "language"
order: 35
sourcePath: "language/borrow-checker.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Borrow checker (design)

Silk’s long-term design includes a borrow-checker-style static safety layer
over references and mutation. Silk currently enforces a simpler,
explicit `mut` borrow contract (see mutability).

Full reference: [borrow checker](/silk/wiki/language/borrow-checker/).

## Example: explicit mutable borrow
```silk
struct Counter {
  value: int,
}

fn inc (mut c: &Counter) -> void {
  c.value += 1;
}

fn main () -> int {
  let mut c: Counter = Counter{ value: 0 };
  inc(mut c);
  return c.value;
}
```

## See also

- Mutability rules: [mutability](/silk/wiki/language/mutability/)
- Full reference: [borrow checker](/silk/wiki/language/borrow-checker/)
