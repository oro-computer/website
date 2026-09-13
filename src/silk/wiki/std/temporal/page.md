---
layout: "silkWiki-docs"
title: "std::temporal"
description: "std::temporal provides Instant/Duration helpers and time-related utilities."
docsCollection: "silkWiki"
section: "std"
order: 81
sourcePath: "std/temporal.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::temporal`](/silk/docs/std/temporal/)

[`std::temporal`](/silk/docs/std/temporal/) provides `Instant`/`Duration` helpers and time-related
utilities.

Full reference: [temporal](/silk/wiki/std/temporal/).

## Example
```silk
import std::temporal;

fn main () -> int {
  let z: Duration = std::temporal::duration_zero();
  if !std::temporal::is_zero(z) { return 1; }
  if std::temporal::is_negative(1s) { return 2; }
  if !std::temporal::is_negative(-1s) { return 3; }
  return 0;
}
```

## See also

- Full reference: [temporal](/silk/wiki/std/temporal/)
- Time types: [duration instant](/silk/wiki/language/duration-instant/)
