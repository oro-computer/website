---
layout: "docs"
title: "Regions (with)"
description: "Regions provide a fixed-size, statically allocated backing store that can be used as an allocation context for new."
docsCollection: "silkWiki"
section: "language"
order: 37
sourcePath: "language/regions.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Regions (`with`)

Regions provide a fixed-size, statically allocated backing store that can be
used as an allocation context for `new`.

Full reference: [regions](/silk/wiki/language/regions/).

## Notes

- Supported forms + Limitations: [regions](/silk/wiki/language/regions/)

## Syntax
```silk
const region region_buf: u8[1024];

with region_buf {
  // `new` allocations use `region_buf` as backing storage.
}
```

## Example
```silk
struct Point {
  x: int,
  y: int,
}

fn main () -> int {
  const region region_buf: u8[1024];
  with region_buf {
    let p: &Point = new Point{ x: 1, y: 2 };
    return p.x + p.y;
  }
}
```

## See also

- Full reference: [regions](/silk/wiki/language/regions/)
- Memory model and `new`: [memory model](/silk/wiki/language/memory-model/)
- `--noheap` and [`std::runtime::mem`](/silk/docs/std/runtime-mem/): [runtime](/silk/wiki/std/runtime/)
