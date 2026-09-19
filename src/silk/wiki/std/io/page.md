---
layout: "docs"
description: "std::io provides basic stdin/stdout/stderr I/O and a small formatting surface (print/println)."
docsCollection: "silkWiki"
section: "std"
order: 54
sourcePath: "std/io.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::io`](/silk/docs/std/io/)

[`std::io`](/silk/docs/std/io/) provides basic stdin/stdout/stderr I/O and a small formatting surface
(`print`/`println`).

Full reference: [io](/silk/wiki/std/io/).

## Notes

- Design + implementation: basic reads/writes are implemented via [`std::runtime::io`](/silk/docs/std/runtime-io/).
- Full reference: [io](/silk/wiki/std/io/)

## Importing

```silk
import std::io;
```

## Examples

### Example: formatted printing
```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

## See also

- Full reference: [io](/silk/wiki/std/io/)
- Format strings: [fmt](/silk/wiki/std/fmt/)
- Runtime backend: [runtime](/silk/wiki/std/runtime/)
