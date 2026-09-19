---
layout: "docs"
description: "continue; skips the remainder of the current loop body and advances to the next iteration."
docsCollection: "silkWiki"
section: "language"
order: 10
sourcePath: "language/flow-continue.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `continue`

`continue;` skips the remainder of the current loop body and advances to the
next iteration.

Full reference: [flow continue](/silk/wiki/language/flow-continue/).

## Notes

- Supported forms + diagnostics: [flow continue](/silk/wiki/language/flow-continue/)

## Syntax

```silk
continue;
```

## Example
```silk
fn main () -> int {
  let mut sum: int = 0;
  for i in 0..5 {
    if i == 3 {
      continue;
    }
    sum += i;
  }
  return sum; // 0 + 1 + 2 + 4 = 7
}
```

## See also

- Full reference: [flow continue](/silk/wiki/language/flow-continue/)
- `break`: [flow break](/silk/wiki/language/flow-break/)
