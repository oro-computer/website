---
layout: "docs"
title: "Formal verification (Formal Silk)"
description: "Silk includes syntax for writing contracts and verification metadata:"
docsCollection: "silkWiki"
section: "language"
order: 46
sourcePath: "language/formal-verification.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Formal verification (Formal Silk)

Silk includes syntax for writing contracts and verification metadata:

- `#require` / `#assure` for pre/postconditions
- `#assert` for local assertions
- `#invariant` / `#variant` / `#monovariant` for loops

Full reference: [formal verification](/silk/wiki/language/formal-verification/).

## Example (Design / verifier-oriented)

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

## See also

- Full reference: [formal verification](/silk/wiki/language/formal-verification/)
