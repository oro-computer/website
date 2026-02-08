# `std::bits`

`std::bits` is the standard bit-manipulation and byte-order helper module.

Canonical doc: `docs/std/bits.md`.

## What works today (current subset)

Implemented in `std/bits.slk`:

- Byte swaps:
 - `std::bits::bswap_u16`
 - `std::bits::bswap_u32`
 - `std::bits::bswap_u64`
- Rotations:
 - `std::bits::rotl_u32`, `std::bits::rotr_u32`
 - `std::bits::rotl_u64`, `std::bits::rotr_u64`
- Bit counts:
 - `std::bits::popcount_u32`, `std::bits::clz_u32`, `std::bits::ctz_u32`
 - `std::bits::popcount_u64`, `std::bits::clz_u64`, `std::bits::ctz_u64`

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
