---
layout: "docs"
description: "break; exits the nearest enclosing loop."
docsCollection: "silkWiki"
section: "language"
order: 9
sourcePath: "language/flow-break.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `break`

`break;` exits the nearest enclosing loop.

Full reference: [flow break](/silk/wiki/language/flow-break/).

## Notes

- Supported forms + diagnostics: [flow break](/silk/wiki/language/flow-break/)

## Syntax

```silk
break;
```

## Example
```silk
fn main () -> int {
  let mut i: int = 0;
  while true {
    i += 1;
    if i == 3 {
      break;
    }
  }
  return i;
}
```

## See also

- Full reference: [flow break](/silk/wiki/language/flow-break/)
- `continue`: [flow continue](/silk/wiki/language/flow-continue/)
