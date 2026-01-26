# `std::bits`

Status: **Implemented subset**. A small bit-manipulation
and byte-order helper subset is implemented in `std/bits.slk` for the current
backend subset.

`std::bits` provides common bit “twiddling” helpers:

- byte swaps (`bswap_*`),
- bit rotations (`rotl_*`, `rotr_*`),
- and bit counts (`popcount_*`, `clz_*`, `ctz_*`).

See also:

- `docs/language/operators.md` (bitwise operators and shift semantics)
- `docs/std/networking.md` (`std::net` byte-order helpers built on the hosted baseline)

## Implemented API

```silk
module std::bits;

export pure fn bswap_u16 (x: u16) -> u16;
export pure fn bswap_u32 (x: u32) -> u32;
export pure fn bswap_u64 (x: u64) -> u64;

export pure fn rotl_u32 (v: u32, shift: u32) -> u32;
export pure fn rotr_u32 (v: u32, shift: u32) -> u32;

export pure fn rotl_u64 (v: u64, shift: u32) -> u64;
export pure fn rotr_u64 (v: u64, shift: u32) -> u64;

export pure fn popcount_u32 (x: u32) -> u32;
export pure fn clz_u32 (x: u32) -> u32;
export pure fn ctz_u32 (x: u32) -> u32;

export pure fn popcount_u64 (x: u64) -> u32;
export pure fn clz_u64 (x: u64) -> u32;
export pure fn ctz_u64 (x: u64) -> u32;
```

### Rotation semantics

- `rotl_u32` / `rotr_u32` mask the shift amount by `31`.
- `rotl_u64` / `rotr_u64` mask the shift amount by `63`.

This means all shift values are valid and rotations do not rely on any
target-specific shift masking behavior.

### Count semantics

- `popcount_*` counts the number of 1-bits.
- `clz_*` counts leading zeros.
- `ctz_*` counts trailing zeros.

For `clz_*` and `ctz_*`, when the input is `0` the function returns the full
bit width (`32` or `64`).

## Example

```silk
import std::bits;

fn main () -> int {
  let x: u32 = std::bits::rotl_u32(1, 5);
  if x != ((1 as u32) << 5) {
    return 1;
  }

  let y: u64 = std::bits::bswap_u64(4660); // 0x0000_0000_0000_1234
  if y == 0 {
    return 2;
  }

  return 0;
}
```
