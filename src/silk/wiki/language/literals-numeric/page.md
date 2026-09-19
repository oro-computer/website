---
layout: "docs"
description: "Silk supports integer and floating-point literals, including base prefixes suffixes as defined in the canonical spec."
docsCollection: "silkWiki"
section: "language"
order: 22
sourcePath: "language/literals-numeric.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Numeric literals

Silk supports integer and floating-point literals, including base prefixes
suffixes as defined in the canonical spec.

Full reference: [literals numeric](/silk/wiki/language/literals-numeric/).

## Example
```silk
fn main () -> int {
  let a: int = 42;
  let b: u64 = 0xff as u64;
  let c: f64 = 1.5;
  if a + (b as int) > 0 && c > 0.0 {
    return 0;
  }
  return 1;
}
```

## See also

- Full reference: [literals numeric](/silk/wiki/language/literals-numeric/)
- Operators: [operators](/silk/wiki/language/operators/)
