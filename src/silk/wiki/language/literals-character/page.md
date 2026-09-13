---
layout: "docs"
title: "Character literals"
description: "char represents a Unicode scalar value. Character literals write a char value directly in source code."
docsCollection: "silkWiki"
section: "language"
order: 24
sourcePath: "language/literals-character.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Character literals

`char` represents a Unicode scalar value. Character literals write a `char`
value directly in source code.

Full reference: [literals character](/silk/wiki/language/literals-character/).

## Example
```silk
fn main () -> int {
  let a: char = 'A';
  let nl: char = '\\n';
  if a != 'A' { return 1; }
  if nl != '\\n' { return 2; }
  return 0;
}
```

## See also

- Full reference: [literals character](/silk/wiki/language/literals-character/)
