---
layout: "docs"
title: "std::interfaces"
description: "std::interfaces defines shared std protocol interfaces such as Drop, Len, and Iterator(T)."
docsCollection: "silkWiki"
section: "std"
order: 52
sourcePath: "std/interfaces.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::interfaces`](/silk/docs/std/interfaces/)

[`std::interfaces`](/silk/docs/std/interfaces/) defines shared std protocol interfaces such as `Drop`,
`Len`, and `Iterator(T)`.

Full reference: [interfaces](/silk/wiki/std/interfaces/).

## Example: `Iterator(T)` and `next() -> T?`
```silk
import std::interfaces;

struct CounterIter {
  cur: int,
  end: int,
}

impl CounterIter {
  public fn init (end: int) -> CounterIter {
    return { cur: 0, end: end };
  }
}

impl CounterIter as std::interfaces::Iterator(int) {
  public fn next (mut self: &CounterIter) -> int? {
    if self.cur >= self.end {
      return None;
    }
    let v: int = self.cur;
    self.cur = self.cur + 1;
    return Some(v);
  }
}
```

## See also

- Full reference: [interfaces](/silk/wiki/std/interfaces/)
- `for` iterator iteration: [flow for](/silk/wiki/language/flow-for/)
