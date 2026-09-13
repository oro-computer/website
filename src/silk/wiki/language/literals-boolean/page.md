---
layout: "silkWiki-docs"
title: "Boolean literals"
description: "Silk has the boolean type bool with literals true and false."
docsCollection: "silkWiki"
section: "language"
order: 25
sourcePath: "language/literals-boolean.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Boolean literals

Silk has the boolean type `bool` with literals `true` and `false`.

Full reference: [literals boolean](/silk/wiki/language/literals-boolean/).

## Example
```silk
fn main () -> int {
  let ok: bool = true;
  if ok && !false {
    return 0;
  }
  return 1;
}
```
