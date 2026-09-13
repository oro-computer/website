---
layout: "silkWiki-docs"
title: "std::formal"
description: "std::formal provides reusable Formal Silk theories (“standard lemmas”) used by stdlib code and downstream verified code."
docsCollection: "silkWiki"
section: "std"
order: 82
sourcePath: "std/formal.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::formal`](/silk/docs/std/formal/)

[`std::formal`](/silk/docs/std/formal/) provides reusable Formal Silk theories (“standard lemmas”) used
by stdlib code and downstream verified code.

Full reference: [formal](/silk/wiki/std/formal/).

## Notes

- Supported forms is available (initial theory set).
- Full reference: [formal](/silk/wiki/std/formal/)

## Importing

Theories are imported via file imports and applied with `#theory`:

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";
```

## Examples

### Example: applying standard theories
```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
fn get_at (index: i64, len: i64) -> i64 {
  return index;
}
```

## See also

- Full reference: [formal](/silk/wiki/std/formal/)
- Formal verification: [formal verification](/silk/wiki/language/formal-verification/)
