# `std::unicode`

Status: **Implemented**.

This module provides practical Unicode helpers focused on:

- code point classification (whitespace, identifier rules, casing metadata),
- surfaces that are easy to support in the current compiler/backend subset.

The core `char` type in Silk is a Unicode scalar value (see `docs/language/types.md`).

## API (Implemented)

```silk
module std::unicode;

export fn is_white_space (c: char) -> bool;
export fn is_id_start (c: char) -> bool;
export fn is_id_continue (c: char) -> bool;

export fn is_cased (c: char) -> bool;
export fn is_case_ignorable (c: char) -> bool;
```

Notes:

- These helpers classify a single Unicode scalar value (`char`).
- String-level Unicode features (normalization, grapheme segmentation, etc.)
  are future work and require UTF-8 decoding APIs.

## Related Documents

- `docs/language/types.md` (`char`)
- `docs/std/regex.md` (regex literals and matching)
