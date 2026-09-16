---
layout: "docs"
description: "Duration literals represent time spans with unit suffixes (ms, s, min, etc) and produce a Duration value."
docsCollection: "silkWiki"
section: "language"
order: 26
sourcePath: "language/literals-duration.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Duration literals

Duration literals represent time spans with unit suffixes (`ms`, `s`, `min`,
etc) and produce a `Duration` value.

Full reference: [literals duration](/silk/wiki/language/literals-duration/).

## Example
```silk
fn main () -> int {
  let a: Duration = 10ms;
  let b: Duration = 2s;
  let c: Duration = a + b;
  if c > a { return 0; }
  return 1;
}
```

## See also

- Full reference: [literals duration](/silk/wiki/language/literals-duration/)
- `Duration` and `Instant`: [duration instant](/silk/wiki/language/duration-instant/)
