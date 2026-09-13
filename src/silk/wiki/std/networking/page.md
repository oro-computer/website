---
layout: "silkWiki-docs"
title: "std::net"
description: "std::net provides networking primitives (hosted POSIX baseline)."
docsCollection: "silkWiki"
section: "std"
order: 75
sourcePath: "std/networking.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::net`](/silk/docs/std/networking/)

[`std::net`](/silk/docs/std/networking/) provides networking primitives (hosted POSIX baseline).

Full reference: [networking](/silk/wiki/std/networking/).

## Example: IPv4 helpers
```silk
import std::net;

fn main () -> int {
  let a = ipv4(127, 0, 0, 1);
  if !ipv4_is_loopback(a) { return 1; }
  return 0;
}
```

## See also

- Full reference: [networking](/silk/wiki/std/networking/)
