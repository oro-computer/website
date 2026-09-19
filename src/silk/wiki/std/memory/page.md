---
layout: "docs"
description: "std::memory provides low-level helpers and the long-term allocator design."
docsCollection: "silkWiki"
section: "std"
order: 64
sourcePath: "std/memory.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::memory`](/silk/docs/std/memory/)

[`std::memory`](/silk/docs/std/memory/) provides low-level helpers and the long-term allocator design.

Full reference: [memory](/silk/wiki/std/memory/).

## Importing

```silk
import std::memory;
```

## Example: alignment helpers
```silk
import std::memory;

fn main () -> int {
  if !std::memory::is_power_of_two_u64(8) { return 1; }
  if std::memory::align_up_u64(9, 8) != 16 { return 2; }
  return 0;
}
```

## See also

- Full reference: [memory](/silk/wiki/std/memory/)
- Regions: [regions](/silk/wiki/language/regions/)
