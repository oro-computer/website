---
layout: "docs"
title: "std::algorithms"
description: "std::algorithms provides common algorithms over collections. Today, a small Supported forms exists for scalar types."
docsCollection: "silkWiki"
section: "std"
order: 63
sourcePath: "std/algorithms.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::algorithms`](/silk/docs/std/algorithms/)

[`std::algorithms`](/silk/docs/std/algorithms/) provides common algorithms over collections. Today, a small
Supported forms exists for scalar types.

Full reference: [algorithms](/silk/wiki/std/algorithms/).

## Importing

```silk
import std::algorithms;
```

## Example: `clamp_int`
```silk
import std::algorithms;

fn main () -> int {
  if std::algorithms::clamp_int(10, 0, 5) != 5 { return 1; }
  if std::algorithms::clamp_int(-1, 0, 5) != 0 { return 2; }
  return 0;
}
```

## See also

- Full reference: [algorithms](/silk/wiki/std/algorithms/)
