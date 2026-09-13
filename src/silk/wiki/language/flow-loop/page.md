---
layout: "silkWiki-docs"
title: "loop"
description: "loop { ... } is an infinite loop that exits via break or return."
docsCollection: "silkWiki"
section: "language"
order: 6
sourcePath: "language/flow-loop.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`loop`](/silk/wiki/language/flow-loop/)

`loop { ... }` is an infinite loop that exits via `break` or `return`.

Full reference: [flow loop](/silk/wiki/language/flow-loop/).

## Notes

- Supported forms + tests: [flow loop](/silk/wiki/language/flow-loop/)

## Syntax

```silk
loop {
  // ...
}
```

## Example
```silk
fn main () -> int {
  let mut i: int = 0;
  loop {
    if i == 3 {
      break;
    }
    i += 1;
  }
  return i;
}
```

## See also

- Full reference: [flow loop](/silk/wiki/language/flow-loop/)
- `break`: [flow break](/silk/wiki/language/flow-break/)
