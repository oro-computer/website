# `std::unicode`

This module provides practical Unicode helpers focused on:

- code point classification (whitespace, identifier rules, casing metadata),
- scalar UTF-8 length and encoding helpers,
- surfaces that are easy to support in the current compiler/backend subset.

The core `char` type in Silk is a Unicode scalar value (see
[types](?p=language/types)). A `string` is a length-tracked UTF-8 byte sequence.
Converting `char` values into a `string` or `std::strings::String` requires
UTF-8 encoding; raw pointer casts are only valid for memory that already holds
encoded bytes.

## Exported API

```silk
module std::unicode;

export fn utf8_len (c: char) -> i64;
export fn encode_utf8 (c: char, dst: std::arrays::ByteSlice) -> i64?;

export fn is_scalar_value (codepoint: int) -> bool;
export fn utf8_len_codepoint (codepoint: int) -> i64?;
export fn encode_utf8_codepoint (codepoint: int, dst: std::arrays::ByteSlice) -> i64?;

export fn is_white_space (c: char) -> bool;
export fn is_id_start (c: char) -> bool;
export fn is_id_continue (c: char) -> bool;

export fn is_cased (c: char) -> bool;
export fn is_case_ignorable (c: char) -> bool;
```

Notes:

- These helpers classify a single Unicode scalar value (`char`).
- `utf8_len(c)` returns `1`, `2`, `3`, or `4`, the number of bytes needed to
 encode one scalar value.
- `encode_utf8(c, dst)` writes the UTF-8 bytes for `c` into `dst` and returns
 the number of bytes written.
- `encode_utf8(c, dst)` returns `None` when `dst.len` is too small or when a
 non-empty write has no destination storage.
- Since `char` is already a Unicode scalar value, invalid scalar handling is
 not part of this API boundary.
- `is_scalar_value(codepoint)`, `utf8_len_codepoint(codepoint)`, and
 `encode_utf8_codepoint(codepoint, dst)` are for parsers/formatters that
 decode escape sequences into integer codepoints before writing UTF-8. Invalid
 scalar values return `false` or `None`.
- String-level Unicode features beyond scalar encoding (normalization,
 grapheme segmentation, etc.) are future work and require UTF-8 decoding APIs.

Example:

```silk
import std::arrays;
import std::runtime::mem;
import std::unicode;

fn main () -> int {
  let ptr: u64 = std::runtime::mem::alloc(4);
  if ptr == 0 {
    return 1;
  }

  let dst: std::arrays::ByteSlice = std::arrays::ByteSlice.init(ptr, 4);
  let written: i64? = std::unicode::encode_utf8('\u{00E9}', dst);
  if written != Some(2) {
    std::runtime::mem::free(ptr);
    return 2;
  }

  std::runtime::mem::free(ptr);
  return 0;
}
```

## Related Documents

- [types](?p=language/types) (`char`)
- [literals string](?p=language/literals-string) (`string` as UTF-8 bytes)
- [strings](?p=std/strings) (`String.from_chars` and `StringBuilder.push_char`)
- [regex](?p=std/regex) (regex literals and matching)
