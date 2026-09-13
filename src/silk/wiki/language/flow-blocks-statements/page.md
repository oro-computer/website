---
layout: "silkWiki-docs"
title: "Blocks and statements"
description: "Blocks ({ ... }) group statements and introduce a new scope."
docsCollection: "silkWiki"
section: "language"
order: 13
sourcePath: "language/flow-blocks-statements.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Blocks and statements

Blocks (`{ ... }`) group statements and introduce a new scope.

Full reference: [flow blocks statements](/silk/wiki/language/flow-blocks-statements/).

## Notes

- Supported forms + syntax notes: [flow blocks statements](/silk/wiki/language/flow-blocks-statements/)

## Example: scope boundaries
```silk
fn main () -> int {
  let x: int = 1;
  {
    let y: int = 2;
    if x + y != 3 {
      return 1;
    }
  }
  // `y` is not in scope here.
  return 0;
}
```

## See also

- Full reference: [flow blocks statements](/silk/wiki/language/flow-blocks-statements/)
- Expression statements: [flow expression statements](/silk/wiki/language/flow-expression-statements/)
