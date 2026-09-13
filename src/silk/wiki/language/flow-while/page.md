---
layout: "docs"
title: "while"
description: "Use while for condition-controlled looping."
docsCollection: "silkWiki"
section: "language"
order: 7
sourcePath: "language/flow-while.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`while`](/silk/wiki/language/flow-while/)

Use [`while`](/silk/wiki/language/flow-while/) for condition-controlled looping.

Full reference: [flow while](/silk/wiki/language/flow-while/).

## Notes

- Supported forms + tests: [flow while](/silk/wiki/language/flow-while/)

## Syntax

```silk
while condition {
  // ...
}
```

## Example
```silk
fn main () -> int {
  let mut i: int = 0;
  let mut sum: int = 0;

  while i < 3 {
    sum += i;
    i += 1;
  }

  return sum; // 0 + 1 + 2 = 3
}
```

## See also

- Full reference: [flow while](/silk/wiki/language/flow-while/)
- `break` / `continue`: [flow break](/silk/wiki/language/flow-break/), [flow continue](/silk/wiki/language/flow-continue/)
