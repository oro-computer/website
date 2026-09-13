---
layout: "silkWiki-docs"
title: "std::strings"
description: "std::strings provides utilities and types built on top of the core string type (UTF‑8 bytes), including simple comparisons and owned string construction."
docsCollection: "silkWiki"
section: "std"
order: 56
sourcePath: "std/strings.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::strings`](/silk/docs/std/strings/)

[`std::strings`](/silk/docs/std/strings/) provides utilities and types built on top of the core `string`
type (UTF‑8 bytes), including simple comparisons and owned
string construction.

Full reference: [strings](/silk/wiki/std/strings/).

## Notes

- Supported forms is available; long-term API is still evolving.
- Full reference: [strings](/silk/wiki/std/strings/)

## Importing

```silk
import std::strings;
```

## Exported API

```silk
module std::strings;

export fn eq (a: string, b: string) -> bool;
export fn is_empty (s: string) -> bool;
export fn or_empty (s: string?) -> string;
```

## Examples

### Example: equality + optionals
```silk
import std::strings;

fn main () -> int {
  let a: string = "hi";
  let b: string? = None;

  if std::strings::eq(a, "hi") && std::strings::is_empty(std::strings::or_empty(b)) {
    return 0;
  }
  return 1;
}
```

## See also

- Full reference: [strings](/silk/wiki/std/strings/)
- String literal semantics: [literals string](/silk/wiki/language/literals-string/)
- FFI string ABI rules: [ext](/silk/wiki/language/ext/)
