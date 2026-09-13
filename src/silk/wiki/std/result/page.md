---
layout: "silkWiki-docs"
title: "std::result"
description: "std::result standardizes the common “success or error” return shape as Result(T, E) so APIs across std:: compose cleanly."
docsCollection: "silkWiki"
section: "std"
order: 53
sourcePath: "std/result.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::result`](/silk/docs/std/result/)

[`std::result`](/silk/docs/std/result/) standardizes the common “success or error” return shape as
`Result(T, E)` so APIs across `std::` compose cleanly.

Full reference: [result](/silk/wiki/std/result/).

## Notes

- Implemented (current representation is a tagged union enum).
- Full reference: [result](/silk/wiki/std/result/)

## Importing

```silk
import std::result;
```

## Examples

### Example: create and inspect a `Result`
```silk
import std::result;

type R = std::result::Result(int, string);

fn main () -> int {
  let check: R = R.ok(123);
  match (check) {
    Err(_) => {
      return 1;
    },
  }

  let value: int = R.ok(123) ?? 0;
  if value != 123 { return 2; }
  return 0;
}
```

## See also

- Full reference: [result](/silk/wiki/std/result/)
- Error model: [errors](/silk/wiki/language/errors/), [typed errors](/silk/wiki/language/typed-errors/)
