---
layout: "silkWiki-docs"
title: "std::bits"
description: "std::bits is the standard bit-manipulation and byte-order helper module."
docsCollection: "silkWiki"
section: "std"
order: 62
sourcePath: "std/bits.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::bits`](/silk/docs/std/bits/)

[`std::bits`](/silk/docs/std/bits/) is the standard bit-manipulation and byte-order helper module.

Full reference: [bits](/silk/wiki/std/bits/).

## Supported forms
Defined in [`std/bits.slk`](https://github.com/oro-computer/silk/blob/master/std/bits.slk):

- Byte swaps:
 - [`std::bits::bswap_u16`](/silk/docs/std/bits/)
 - [`std::bits::bswap_u32`](/silk/docs/std/bits/)
 - [`std::bits::bswap_u64`](/silk/docs/std/bits/)
- Rotations:
 - [`std::bits::rotl_u32`](/silk/docs/std/bits/), [`std::bits::rotr_u32`](/silk/docs/std/bits/)
 - [`std::bits::rotl_u64`](/silk/docs/std/bits/), [`std::bits::rotr_u64`](/silk/docs/std/bits/)
- Bit counts:
 - [`std::bits::popcount_u32`](/silk/docs/std/bits/), [`std::bits::clz_u32`](/silk/docs/std/bits/), [`std::bits::ctz_u32`](/silk/docs/std/bits/)
 - [`std::bits::popcount_u64`](/silk/docs/std/bits/), [`std::bits::clz_u64`](/silk/docs/std/bits/), [`std::bits::ctz_u64`](/silk/docs/std/bits/)

## Example

```silk
import std::bits;

fn main () -> int {
  let v: u32 = 1;
  let r: u32 = std::bits::rotl_u32(v, 5);
  if r != ((1 as u32) << 5) {
    return 1;
  }

  if std::bits::popcount_u32(r) != 1 {
    return 2;
  }

  return 0;
}
```
