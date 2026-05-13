# `std::bits`

`std::bits` is the standard bit-manipulation and byte-order helper module.

Canonical doc: [bits](?p=std/bits).

## Supported forms
Implemented in `std/bits.slk`:

- Byte swaps:
 - `bits::bswap_u16`
 - `bits::bswap_u32`
 - `bits::bswap_u64`
- Rotations:
 - `bits::rotl_u32`, `bits::rotr_u32`
 - `bits::rotl_u64`, `bits::rotr_u64`
- Bit counts:
 - `bits::popcount_u32`, `bits::clz_u32`, `bits::ctz_u32`
 - `bits::popcount_u64`, `bits::clz_u64`, `bits::ctz_u64`

## Example

```silk
import bits from "std/bits";

fn main () -> int {
  let v: u32 = 1;
  let r: u32 = bits::rotl_u32(v, 5);
  if r != ((1 as u32) << 5) {
    return 1;
  }

  if bits::popcount_u32(r) != 1 {
    return 2;
  }

  return 0;
}
```
