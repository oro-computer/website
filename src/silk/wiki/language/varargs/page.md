---
layout: "docs"
title: "Varargs (...args)"
description: "Silk supports “varargs” parameters to accept a variable number of trailing arguments, used by std::io::print / std::io::println."
docsCollection: "silkWiki"
section: "language"
order: 43
sourcePath: "language/varargs.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Varargs (`...args`)

Silk supports “varargs” parameters to accept a variable number of trailing
arguments, used by [`std::io::print`](/silk/docs/std/io/) / [`std::io::println`](/silk/docs/std/io/).

Full reference: [varargs](/silk/wiki/language/varargs/).

## Syntax

```silk
fn log (fmt: string, ...args: std::fmt::Arg) -> void {
  std::io::println(fmt, args);
}
```

## Example
```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

## See also

- Full reference: [varargs](/silk/wiki/language/varargs/)
- [`std::fmt`](/silk/docs/std/fmt/): [fmt](/silk/wiki/std/fmt/)
