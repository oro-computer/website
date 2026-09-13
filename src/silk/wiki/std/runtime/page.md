---
layout: "docs"
title: "std::runtime"
description: "std::runtime is the interface layer that isolates OS/environment-specific primitives (I/O, filesystem, time, threads, allocation) from higher-level std::... modules."
docsCollection: "silkWiki"
section: "std"
order: 78
sourcePath: "std/runtime.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime`](/silk/docs/std/runtime/)

[`std::runtime`](/silk/docs/std/runtime/) is the interface layer that isolates OS/environment-specific
primitives (I/O, filesystem, time, threads, allocation) from higher-level
`std::...` modules.

Full reference: [runtime](/silk/wiki/std/runtime/).

## Notes

- Design + partial implementation.
- Full reference: [runtime](/silk/wiki/std/runtime/)

## Importing

```silk
import std::runtime::build;
import std::runtime::mem;
```

## Examples

### Example: build metadata + raw memory
```silk
import std::runtime::build;
import std::runtime::mem;

fn main () -> int {
  // This reports whether the current artifact was built with `--debug` / `-g`.
  if std::runtime::build::is_debug() {
    return 1;
  }

  // `std::runtime::mem` provides low-level allocation and raw load/store.
  let ptr: u64 = std::runtime::mem::alloc(4);
  if ptr == 0 { return 2; }

  std::runtime::mem::store_u8(ptr, 0, std::runtime::mem::trunc_u8(65));
  std::runtime::mem::store_u8(ptr, 1, std::runtime::mem::trunc_u8(66));

  if std::runtime::mem::load_u8(ptr, 0) != 65 {
    std::runtime::mem::free(ptr);
    return 3;
  }

  std::runtime::mem::free(ptr);
  return 0;
}
```

## See also

- Full reference: [runtime](/silk/wiki/std/runtime/)
- Std package structure and swappability: [package structure](/silk/wiki/std/package-structure/)
