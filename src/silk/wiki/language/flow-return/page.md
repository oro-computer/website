---
layout: "docs"
description: "Use return to exit the current function."
docsCollection: "silkWiki"
section: "language"
order: 11
sourcePath: "language/flow-return.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `return`

Use `return` to exit the current function.

Full reference: [flow return](/silk/wiki/language/flow-return/).

## Notes

- Supported forms + diagnostics: [flow return](/silk/wiki/language/flow-return/)

## Syntax

```silk
return;
return expr;
```

## Example
```silk
fn add1 (x: int) -> int {
  return x + 1;
}

fn main () -> int {
  return add1(41);
}
```

## See also

- Full reference: [flow return](/silk/wiki/language/flow-return/)
- `test` blocks allow `return;`: [testing](/silk/wiki/language/testing/)
