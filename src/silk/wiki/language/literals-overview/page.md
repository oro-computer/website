---
layout: "docs"
title: "Literals"
description: "Literals are the simplest way to write values directly in source code: numbers, booleans, chars, strings, durations, and aggregates like arrays struct literals."
docsCollection: "silkWiki"
section: "language"
order: 21
sourcePath: "language/literals-overview.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Literals

Literals are the simplest way to write values directly in source code:
numbers, booleans, chars, strings, durations, and aggregates like arrays
struct literals.

This wiki page is a learning-oriented companion to the canonical spec:
[literals overview](/silk/wiki/language/literals-overview/).

## Notes

- Detailed rules and edge cases: `docs/language/literals-*.md`

## Syntax
```silk
let n: int = 42;
let pi: f64 = 3.14159;
let ok: bool = true;
let c: char = '\\n';
let s: string = "hello";

// Duration literals
let d: Duration = 10ms;

// Aggregates
let xs: int[3] = [1, 2, 3];
// let p: Point = Point{ x: 1, y: 2 };
```

## Examples

### Example: array literal + indexing
```silk
fn main () -> int {
  let xs: int[3] = [10, 20, 30];
  return xs[1];
}
```

### Example: multiline strings
```silk
import std::io;

fn main () -> int {
  std::io::println(`line1
line2`);
  return 0;
}
```

## See also

- Full reference: [literals overview](/silk/wiki/language/literals-overview/)
- Numeric: [literals numeric](/silk/wiki/language/literals-numeric/)
- Strings/chars: [literals string](/silk/wiki/language/literals-string/), [literals character](/silk/wiki/language/literals-character/)
- Aggregates: [literals aggregate](/silk/wiki/language/literals-aggregate/)
