---
layout: "silkWiki-docs"
title: "Expression statements"
description: "Many expressions can appear as standalone statements when followed by ; (assignment, calls, ++/--, and other “statement-like” expressions)."
docsCollection: "silkWiki"
section: "language"
order: 12
sourcePath: "language/flow-expression-statements.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Expression statements

Many expressions can appear as standalone statements when followed by `;`
(assignment, calls, `++`/`--`, and other “statement-like” expressions).

Full reference: [flow expression statements](/silk/wiki/language/flow-expression-statements/).

## Notes

- Supported forms + restrictions: [flow expression statements](/silk/wiki/language/flow-expression-statements/)

## Example: assignment + increment
```silk
fn main () -> int {
  let mut x: int = 0;
  x += 1;
  ++x;
  return x;
}
```

## See also

- Full reference: [flow expression statements](/silk/wiki/language/flow-expression-statements/)
- Operators: [operators](/silk/wiki/language/operators/)
