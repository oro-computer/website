---
layout: "silkWiki-docs"
title: "Memory model"
description: "This page is a learning-oriented companion to the canonical memory model: memory model."
docsCollection: "silkWiki"
section: "language"
order: 36
sourcePath: "language/memory-model.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Memory model

This page is a learning-oriented companion to the canonical memory model:
[memory model](/silk/wiki/language/memory-model/).

At a high level:

- Most values are plain, copyable scalars (or structs that lower to a fixed set
 of scalar slots in Silk).
- Heap allocation is introduced via `new`, producing `&Struct` references.
- `with` regions can redirect `new` allocations away from the heap (see regions).

## Notes

- Canonical spec + implementation notes: [memory model](/silk/wiki/language/memory-model/)

## Example: `new` + reference field access
```silk
struct Point {
  x: int,
  y: int,
}

fn main () -> int {
  let p: &Point = new Point{ x: 1, y: 2 };
  return p.x + p.y;
}
```

## See also

- Regions (`with`): [regions](/silk/wiki/language/regions/)
- `Drop` and cleanup hooks: [interfaces](/silk/wiki/std/interfaces/)
