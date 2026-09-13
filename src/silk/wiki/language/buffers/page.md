---
layout: "silkWiki-docs"
title: "Buffers (Buffer(T)) (design)"
description: "The long-term design includes an intrinsic Buffer(T) type for low-level, unsafe contiguous memory access, intended to sit underneath safe collections."
docsCollection: "silkWiki"
section: "language"
order: 38
sourcePath: "language/buffers.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Buffers (`Buffer(T)`) (design)

The long-term design includes an intrinsic `Buffer(T)` type for low-level,
unsafe contiguous memory access, intended to sit underneath safe collections.

Full reference: [buffers](/silk/wiki/language/buffers/).

In the current toolchain, buffer-like functionality is provided via `std::`:

- [`std::vector::Vector(T)`](/silk/docs/std/vector/) for owning growable storage
- [`std::buffer::BufferU8`](/silk/docs/std/buffer/) as an owning packed byte buffer, plus width-oriented
 scalar buffer aliases (`BufferI32`, etc.)

## Example: buffer aliases
```silk
import std::buffer;

fn main () -> int {
  match (BufferU8.init(4)) {
    Ok(buffer) => {
      let mut b: BufferU8 = buffer;
      b.push(1 as u8);
      b.drop();
      return 0;
    },
    Err(_) => {
      return 1;
    },
  }
}
```

## See also

- Full reference: [buffers](/silk/wiki/language/buffers/)
- [`std::buffer`](/silk/docs/std/buffer/): [buffer](/silk/wiki/std/buffer/)
- [`std::vector`](/silk/docs/std/vector/): [vector](/silk/wiki/std/vector/)
