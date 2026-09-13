---
layout: "silkWiki-docs"
title: "Testing (test)"
description: "Silk supports top-level test declarations that are discovered and executed by silk test."
docsCollection: "silkWiki"
section: "language"
order: 45
sourcePath: "language/testing.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Testing (`test`)

Silk supports top-level `test` declarations that are discovered and executed by
`silk test`.

Full reference: [testing](/silk/wiki/language/testing/).

## Syntax

```silk
test "addition works" {
  if (1 + 2) != 3 {
    std::abort();
  }
}
```

## See also

- Full reference: [testing](/silk/wiki/language/testing/)
- CLI runner: [cli silk](/silk/docs/compiler/cli-silk/)
