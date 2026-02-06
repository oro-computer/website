# `std::number`

Status: **Implemented**.

This module provides small, dependency-light number parsing and formatting
helpers.

The initial surface focuses on:

- stable, strict parsing from `string` to numeric types, and
- formatting numeric values into owned `std::strings::String` outputs.

## API (Implemented)

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

## Related Documents

- `docs/std/strings.md` (owned `String`)
- `docs/language/literals-numeric.md` (numeric literal syntax)
