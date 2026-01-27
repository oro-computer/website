# `std::limits`

Status: **Implemented**.

This module provides shared numeric limits for Silk primitive types.

The initial surface is intentionally small and focuses on min/max bounds for
fixed-width integer primitives (useful for validating conversions and host
APIs that cap sizes to a particular width, such as `i32`).

## API (Implemented)

```silk
module std::limits;

export const I8_MIN: i8;
export const I8_MAX: i8;
export const U8_MAX: u8;

export const I16_MIN: i16;
export const I16_MAX: i16;
export const U16_MAX: u16;

export const I32_MIN: i32;
export const I32_MAX: i32;
export const U32_MAX: u32;

export const I64_MIN: i64;
export const I64_MAX: i64;
export const U64_MAX: u64;

export const INT_MIN: int;
export const INT_MAX: int;
```

## Example

Validating that a host-facing length fits in `i32`:

```silk
import std::limits;

fn validate_len (len: i64) -> bool {
  return len >= 0 && len <= (std::limits::I32_MAX as i64);
}
```
