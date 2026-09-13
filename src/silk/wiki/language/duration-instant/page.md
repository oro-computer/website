---
layout: "docs"
title: "Duration and Instant"
description: "Duration represents a signed time span and Instant represents a signed point-in-time on a monotonic timeline. the backend treats both as distinct Silk types that lower to i64 nanoseconds."
docsCollection: "silkWiki"
section: "language"
order: 27
sourcePath: "language/duration-instant.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `Duration` and `Instant`

`Duration` represents a signed time span and `Instant` represents a signed
point-in-time on a monotonic timeline. the backend treats both
as distinct Silk types that lower to `i64` nanoseconds.

Full reference: [duration instant](/silk/wiki/language/duration-instant/).

## Example: `Duration` arithmetic
```silk
fn main () -> int {
  let a: Duration = 10ms;
  let b: Duration = 2s;
  let c: Duration = a + b;
  if c > a {
    return 0;
  }
  return 1;
}
```

## See also

- Full reference: [duration instant](/silk/wiki/language/duration-instant/)
- Duration literals: [literals duration](/silk/wiki/language/literals-duration/)
- Temporal stdlib: [temporal](/silk/wiki/std/temporal/)
