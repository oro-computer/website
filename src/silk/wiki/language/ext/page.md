---
layout: "docs"
title: "External declarations (ext)"
description: "ext declares foreign symbols so Silk code can call C (or wasm imports) access foreign variables."
docsCollection: "silkWiki"
section: "language"
order: 44
sourcePath: "language/ext.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# External declarations (`ext`)

`ext` declares foreign symbols so Silk code can call C (or wasm imports)
access foreign variables.

Full reference: [ext](/silk/wiki/language/ext/).

## Notes

- supported `ext` subset + ABI notes: [ext](/silk/wiki/language/ext/)
- Embedding ABI contract: [abi libsilk](/silk/docs/compiler/abi-libsilk/)

## Syntax
```silk
// C function named `puts`.
ext puts = fn (string) -> i32;

// Bind a different symbol name.
ext c_malloc "malloc" = fn (i64) -> u64;
ext c_free "free" = fn (u64) -> void;

// External variable.
ext errno = i32;
```

## Examples

### Example: call a C symbol
```silk
import std::io;

ext puts = fn (string) -> i32;

fn main () -> int {
  puts("hello from ext");
  std::io::println("ok");
  return 0;
}
```

### Example: opaque handle pattern (FFI-safe pointers)
```silk
struct Thing;

ext thing_new = fn () -> &Thing;
ext thing_free = fn (&Thing) -> void;

fn main () -> int {
  let t: &Thing = thing_new();
  thing_free(t);
  return 0;
}
```

## See also

- Full reference: [ext](/silk/wiki/language/ext/)
- ABI details for `string` and optionals: [abi libsilk](/silk/docs/compiler/abi-libsilk/)
