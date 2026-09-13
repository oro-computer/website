---
layout: "silkWiki-docs"
title: "String literals"
description: "string is Silk’s built-in UTF‑8 byte sequence type. String literals write a string value directly in source code."
docsCollection: "silkWiki"
section: "language"
order: 23
sourcePath: "language/literals-string.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# String literals

`string` is Silk’s built-in UTF‑8 byte sequence type. String literals write a
`string` value directly in source code.

Full reference: [literals string](/silk/wiki/language/literals-string/).

## Example: multiline text and escapes
```silk
import std::io;

fn main () -> int {
  std::io::println(`line1
line2`);
  std::io::println("quote=\\\" backslash=\\\\");
  return 0;
}
```

## See also

- Full reference: [literals string](/silk/wiki/language/literals-string/)
- [`std::strings`](/silk/docs/std/strings/): [strings](/silk/wiki/std/strings/)
