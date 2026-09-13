---
layout: "docs"
title: "Flow control overview"
description: "Silk has familiar structured control flow:"
docsCollection: "silkWiki"
section: "language"
order: 3
sourcePath: "language/flow-overview.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Flow control overview

Silk has familiar structured control flow:

- branching: `if` / `else`
- loops: [`while`](/silk/wiki/language/flow-while/), `for`, [`loop`](/silk/wiki/language/flow-loop/)
- structured matching: [`match`](/silk/wiki/language/flow-match/)
- early exit: `break`, `continue`, `return`

Full reference: [flow overview](/silk/wiki/language/flow-overview/).

## Notes

- Reference details: `docs/language/flow-*.md`

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

  if sum > 0 {
    return sum;
  }
  return 0;
}
```

## See also

- `if` / `else`: [flow if else](/silk/wiki/language/flow-if-else/)
- `for`: [flow for](/silk/wiki/language/flow-for/)
- [`match`](/silk/wiki/language/flow-match/): [flow match](/silk/wiki/language/flow-match/)
