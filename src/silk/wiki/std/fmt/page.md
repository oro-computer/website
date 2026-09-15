---
layout: "docs"
description: "std::fmt defines the formatting model used by std::io::print/println by string-building helpers. It follows a Zig-std.fmt-style format-string syntax."
docsCollection: "silkWiki"
section: "std"
order: 55
sourcePath: "std/fmt.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::fmt`](/silk/docs/std/fmt/)

[`std::fmt`](/silk/docs/std/fmt/) defines the formatting model used by [`std::io::print`](/silk/docs/std/io/)/`println`
by string-building helpers. It follows a Zig-`std.fmt`-style format-string
syntax.

Full reference: [fmt](/silk/wiki/std/fmt/).

## Notes

- Supported forms is available to support [`std::io`](/silk/docs/std/io/) printing.
- Full reference: [fmt](/silk/wiki/std/fmt/)

## Examples

### Example: `println` formatting
```silk
import std::io;

fn main () -> int {
  std::io::println("name={s} ok={}", "silk", true);
  return 0;
}
```

## See also

- Full reference: [fmt](/silk/wiki/std/fmt/)
- Printing: [io](/silk/wiki/std/io/)
