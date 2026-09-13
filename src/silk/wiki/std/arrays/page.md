---
layout: "silkWiki-docs"
title: "std::arrays"
description: "std::arrays defines borrowed views like Slice(T) and helpers for working with fixed arrays and slices."
docsCollection: "silkWiki"
section: "std"
order: 57
sourcePath: "std/arrays.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::arrays`](/silk/docs/std/arrays/)

[`std::arrays`](/silk/docs/std/arrays/) defines borrowed views like `Slice(T)` and helpers for working
with fixed arrays and slices.

Full reference: [arrays](/silk/wiki/std/arrays/).

## Notes

- Supported forms + design: a usable subset is implemented.
- Full reference: [arrays](/silk/wiki/std/arrays/)

## Importing

```silk
import std::arrays;
```

## Examples

### Example: `Slice(T)` + `SliceIter(T)`
```silk
import std::arrays;
import std::buffer;

fn main () -> int {
  let mut buf: BufferU64 = BufferU64.init(4);
  buf.push(10);
  buf.push(11);
  buf.push(12);

  let s: std::arrays::Slice(u64) = { ptr: buf.ptr, len: buf.len() };
  let mut it = s.iter();
  let mut sum: u64 = 0;
  while true {
    let v: u64? = it.next();
    if v == None {
      break;
    }
    sum += (v ?? 0 as u64);
  }

  buf.drop();
  if sum != 33 {
    return 1;
  }
  return 0;
}
```

## See also

- Full reference: [arrays](/silk/wiki/std/arrays/)
- `for` iteration rules: [flow for](/silk/wiki/language/flow-for/)
