# Character Literals

Character literals represent Unicode scalar values (code points) and have type
`char` (`docs/language/types.md`).

Use `char` for:

- single-character markers and delimiters (e.g. `','`, `':'`),
- working with code points when interfacing with parsing/lexing logic,
- representing control characters (`'\n'`, `'\t'`, `'\0'`).

If you need multiple characters, use `string` literals (`docs/language/literals-string.md`).

## Implementation Status (Current Compiler Subset)

What works end-to-end today (lexer → parser → checker → lowering → codegen):

- UTF-8 character literals like `'x'`, `'é'`, and `'😀'` (exactly one Unicode
  scalar, encoded in UTF-8 in the source file).
- Escape sequences:
  - `\n`, `\r`, `\t`, `\0`
  - `\\`, `\'`, `\"`
  - `\xNN` (exactly two hex digits)
  - `\u{...}` (1–6 hex digits)
- Equality and inequality comparisons (`==`, `!=`) over `char` values.
- `char` values are lowered as a `u32` scalar in the current IR backend subset.

Not implemented yet (or not specified as stable):

- A dedicated diagnostic for invalid character literal spellings (most invalid
  forms currently surface as generic “unsupported expression” errors in the
  current subset).

## Surface Syntax

Character literals are delimited by single quotes:

```silk
let a: char = 'x';
```

Rules:

- The contents must represent **exactly one Unicode scalar value**.
- A character literal must not span multiple lines.
- The source file is interpreted as UTF-8.

## Escapes

Inside a character literal, `\` introduces an escape sequence.

Supported escapes in the current implementation:

- `\n` — U+000A (line feed)
- `\r` — U+000D (carriage return)
- `\t` — U+0009 (tab)
- `\0` — U+0000 (NUL)
- `\\` — backslash
- `\'` — single quote
- `\"` — double quote
- `\xNN` — a code point given as exactly two hex digits
- `\u{...}` — a code point given as 1–6 hex digits

Unicode rules:

- The decoded code point must be a Unicode scalar value:
  - range `0x0000..=0x10FFFF`, excluding the surrogate range
    `0xD800..=0xDFFF`.
- For `\u{...}`, values outside that range are rejected.

## Semantics

Evaluating a character literal produces a `char` value whose numeric value is
the decoded Unicode code point.

In the current backend subset, that code point is carried as a `u32` scalar.
This is an implementation detail; the language-level rule is “a `char` is a
Unicode scalar value”.

## Examples

### ASCII and punctuation

```silk
fn main () -> int {
  let comma: char = ',';
  if comma == ',' {
    return 0;
  }
  return 1;
}
```

### Unicode: literal UTF-8 vs `\u{...}`

```silk
fn main () -> int {
  let a: char = 'é';
  let b: char = '\u{00E9}';
  if a == b {
    return 0;
  }
  return 1;
}
```

### Escape sequences

```silk
fn main () -> int {
  if '\n' != '\x0A' { return 1; }
  if '\r' != '\x0D' { return 2; }
  if '\t' != '\x09' { return 3; }
  if '\0' != '\x00' { return 4; }
  if '\\' != '\u{005C}' { return 5; }
  if '\'' != '\x27' { return 6; }
  if '\"' != '"' { return 7; }
  return 0;
}
```

## Common Pitfalls

- **Using double quotes**: `"x"` is a `string`, not a `char`. Use `'x'`.
- **Writing more than one character**: `'ab'` is invalid; use `"ab"`.
- **Source encoding surprises**: prefer `\u{...}` for non-ASCII characters when
  you want the source spelling to be stable across editors/fonts.
- **Confusing `\xNN` between `char` and `string`**:
  - for `char`, `\xNN` denotes a code point value,
  - for `string`, `\xNN` denotes a raw byte (`docs/language/literals-string.md`).

## Related Documents

- `docs/language/types.md` (primitive `char` and `string`)
- `docs/language/literals-string.md` (string literals and escape sequences)
- `docs/language/operators.md` (`as` casts for int-like types, including `char`)

## Relevant Tests

- Unicode char equality and `\u{...}` escape:
  - `tests/silk/pass_char_eq.slk`
- Returning and comparing `char` values:
  - `tests/silk/pass_helper_char_return_cfg.slk`
- Escape coverage:
  - `tests/silk/pass_char_literal_escapes.slk`
