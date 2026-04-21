# `std::number`

This module provides small, dependency-light number parsing and formatting
helpers, plus a boxed `Number` value type.

The initial surface focuses on:

- stable, strict parsing from `string` to numeric types, and
- formatting numeric values into owned `std::strings::String` outputs.

## Exported API

### Parsing

Parsing functions return `Result(T, ParseFailed)` for explicit error handling.

```silk
module std::number;

export enum ParseErrorKind {
  InvalidInput,
  Overflow,
  OutOfMemory,
  Unknown,
}

export error ParseFailed {
  code: int,
  offset: int,
}

export type AtodResult = std::result::Result(f64, ParseFailed);
export type Atou64Result = std::result::Result(u64, ParseFailed);
export type Atoi64Result = std::result::Result(i64, ParseFailed);
export type Atou32Result = std::result::Result(u32, ParseFailed);
export type Atoi32Result = std::result::Result(i32, ParseFailed);
export type Atou128Result = std::result::Result(u128, ParseFailed);
export type Atoi128Result = std::result::Result(i128, ParseFailed);

export fn atod (s: string) -> AtodResult;
export fn atou64 (s: string) -> Atou64Result;
export fn atoi64 (s: string) -> Atoi64Result;
export fn atou32 (s: string) -> Atou32Result;
export fn atoi32 (s: string) -> Atoi32Result;
export fn atou128 (s: string) -> Atou128Result;
export fn atoi128 (s: string) -> Atoi128Result;
```

Notes:

- `atou*` parses base-10 unsigned integers; `atoi*` parses base-10 signed
 integers with an optional leading `+`/`-`.
- The integer parsers accept `_` as a digit separator between
 digits (for example `1_000_000`).
- `atod` is strict: the entire input must be consumed (no trailing bytes).
- `ParseFailed.offset` is a byte offset into the original input.
- `atod` may report `OutOfMemory` if the runtime needs temporary storage.

### Formatting

Formatting functions allocate and return owned `std::strings::String` values.

```silk
export fn dtoa (value: f64) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);

export fn u64toa (value: u64) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn i64toa (value: i64) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn u32toa (value: u32) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn i32toa (value: i32) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);

export fn u128toa (value: u128) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn i128toa (value: i128) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
```

### Boxed `Number`

```silk
export const NUMBER_KIND_I128: int = 1;
export const NUMBER_KIND_U128: int = 2;
export const NUMBER_KIND_F64: int = 3;

export struct Number {
  kind: int,
  signed: i128,
  unsigned: u128,
  float: f64,
}

export type ParseNumberResult = std::result::Result(Number, ParseFailed);

impl Number {
  public fn from_i8 (value: i8) -> Number;
  public fn from_i16 (value: i16) -> Number;
  public fn from_i32 (value: i32) -> Number;
  public fn from_i64 (value: i64) -> Number;
  public fn from_i128 (value: i128) -> Number;
  public fn from_u8 (value: u8) -> Number;
  public fn from_u16 (value: u16) -> Number;
  public fn from_u32 (value: u32) -> Number;
  public fn from_u64 (value: u64) -> Number;
  public fn from_u128 (value: u128) -> Number;
  public fn from_f32 (value: f32) -> Number;
  public fn from_f64 (value: f64) -> Number;
  public fn from_int (value: int) -> Number;

  public fn parse (value: string) -> ParseNumberResult;
  public fn is_int (self: &Number) -> bool;
  public fn is_float (self: &Number) -> bool;
  public fn is_signed (self: &Number) -> bool;
  public fn to_i64_exact (self: &Number) -> i64?;
  public fn to_u64_exact (self: &Number) -> u64?;
  public fn to_i128_exact (self: &Number) -> i128?;
  public fn to_u128_exact (self: &Number) -> u128?;
  public fn eq (self: &Number, other: &Number) -> bool;
  public fn to_string (self: &Number) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
}
```

Notes:

- `Number.parse(...)` canonicalizes parsed integers to the tagged `i128` /
 `u128` forms and parsed floats to the tagged `f64` form.
- `Number` is an inline tagged payload. It does not heap-allocate and does not
 require a dedicated enum payload layout in Silk currently.
- Text rendering for `Number` is fallible because it returns an owned
 `std::strings::String`.
- Exact extraction helpers are currently defined for the integer families
 (`i64` / `u64` / `i128` / `u128`).
- For float-backed `Number` values:
 - `to_i64_exact()` / `to_u64_exact()` succeed only for integral values that
 round-trip exactly through the corresponding `f64 <-> i64` / `u64` cast
 path,
 - `to_i128_exact()` is currently a conservative wrapper over the `i64`
 round-trip envelope, so it does not accept larger exact integral `f64`
 values such as `2^63`,
 - `to_u128_exact()` is currently a conservative wrapper over the `u64`
 round-trip envelope, so it can accept exact non-negative `f64` integers
 such as `2^63` while still rejecting values outside the exact `u64`
 envelope.
- Mixed integer/float equality is conservative:
 - values compare equal only when the float side round-trips exactly through
 the supported `i64` / `u64` cast paths,
 - wider `i128` / `u128` mixed comparisons do not guess across unsupported
 backend cast paths, so they return `false` rather than silently losing
 precision.

## Related Documents

- [strings](?p=std/strings) (owned `String`)
- [literals numeric](?p=language/literals-numeric) (numeric literal syntax)
- [boxed values](?p=std/boxed-values) (boxed primitive design)
