# String Literals

String literals represent `string` values: immutable, length-tracked sequences of
bytes that are typically interpreted as UTF-8 text.

Use strings for:

- filenames and paths,
- user-visible messages,
- structured formats (JSON, CSV, etc),
- and general “text” data.

If you need a single Unicode scalar value, use `char` literals
(`docs/language/literals-character.md`).

## Implementation Status (Current Compiler Subset)

What works end-to-end today (lexer → parser → checker → lowering → codegen):

- Double-quote delimited string literals: `"hello"`.
- Backtick-delimited raw string literals: `` `hello` ``.
- Multi-line string literals: newlines may appear inside `"..."` and become part
  of the string value.
- Multi-line raw string literals: newlines may appear inside `` `...` `` and
  become part of the string value.
- Escape sequences:
  - `\\`, `\"`, `\'`
  - `\n`, `\r`, `\t`, `\0`
  - `\xNN` (exactly two hex digits, inserts a single byte)
  - `\u{...}` (1–6 hex digits, inserts UTF-8 bytes for a Unicode scalar)
- Line ending normalization:
  - embedded `\r\n` and `\r` in the literal source are normalized to `\n`,
  - `\r` escapes are normalized to `\n` in the current implementation.
- Equality and ordering comparisons (`==`, `!=`, `<`, `<=`, `>`, `>=`) over
  `string` values in the current subset.

Not implemented yet (or not specified as stable):

- A stable, fully-specified string ABI story across the C boundary beyond what
  is documented in `docs/compiler/abi-libsilk.md`.

## Semantics

- The value of a string literal is a sequence of bytes.
- By convention and by intent, `string` values represent UTF-8 text, but some
  escape forms (notably `\xNN`) can construct byte sequences that are not valid
  UTF-8. Avoid this unless you are intentionally working with raw bytes.
- String literals are immutable.
- Unless otherwise specified for a particular FFI surface, string literals do
  not implicitly include a trailing `\0` byte; length is carried explicitly.

## Single-Line Strings

Single-line string literals:

- Use standard quote-delimited syntax.
- Support escape sequences as described below.

## Raw Strings (Backtick)

Raw string literals are delimited by backticks:

- `` `...` ``
- They may include newlines directly.
- They do **not** process escape sequences: `\n` is two bytes (`'\'` and `'n'`).
- They still normalize embedded `\r\n` / `\r` in the source text to `\n`.

## Escape Sequences

Double-quoted string literals support the same escape spellings as character
literals:

- `\\` (backslash)
- `\"` (double quote)
- `\'` (single quote)
- `\n` (newline, U+000A)
- `\r` (carriage return, U+000D)
- `\t` (tab, U+0009)
- `\0` (NUL byte, U+0000)
- `\xNN` (byte escape, two hex digits)
- `\u{...}` (Unicode scalar value escape, 1–6 hex digits)

When decoding `\u{...}` escapes, the compiler must reject non-scalar Unicode
values (for example surrogate code points).

## Multi-Line Strings

Multi-line strings:

- Allow embedding newlines directly in the literal.
- Must be represented and encoded identically to `string` values produced at runtime.

## Line Ending Normalization

When decoding string literals, the compiler must normalize:

- `\r\n` to `\n`
- `\r` to `\n`

This applies both to embedded newlines in multi-line literals and to escaped
forms such as `\r`.

Note: a sequence of two escapes like `"\r\n"` is still two escapes. In the
current implementation, `\r` escapes become `\n`, so `"\r\n"` produces two line
feed bytes (`"\n\n"`).

## Examples

### Basic string literal

```silk
fn main () -> int {
  let s: string = "hello";
  if s == "hello" {
    return 0;
  }
  return 1;
}
```

### Escapes and byte escapes

```silk
fn main () -> int {
  // Quote and backslash escapes.
  if "\"" != "\x22" { return 1; }
  if "\\" != "\u{005C}" { return 2; }

  // Control escapes.
  if "\t" != "\x09" { return 3; }
  if "\n" != "\x0A" { return 4; }
  if "\r" != "\n" { return 5; } // `\r` is normalized to `\n` in the current subset.

  // NUL bytes are permitted; strings are length-tracked (not NUL-terminated).
  if "\0" != "\x00" { return 6; }

  // Unicode escapes insert UTF-8 bytes for that scalar.
  if "é" != "\u{00E9}" { return 7; }

  return 0;
}
```

### Multi-line string literal (embedded newline)

```silk
fn main () -> int {
  let multi: string = "a
b";

  // Equivalent to using a `\n` escape.
  if multi != "a\nb" {
    return 1;
  }

  return 0;
}
```

### Raw multiline string literal (backticks)

```silk
fn main () -> int {
  let multi: string = `a
b`;
  if multi != "a\nb" {
    return 1;
  }

  // Backslashes are literal bytes in raw strings.
  if `a\nb` != "a\\nb" { return 2; }

  return 0;
}
```

## Common Pitfalls

- **Expecting NUL termination**: `"hi"` does not include an implicit `\0`.
  Use `\0` explicitly when you need it, and prefer APIs that are length-aware.
- **Using `\xNN` for non-ASCII characters**: `\xNN` inserts a raw byte, not a
  Unicode scalar. Use `\u{...}` for text.
- **Assuming multi-line indentation stripping**: multi-line strings include all
  bytes between the quotes, including indentation spaces.

## Related Documents

- `docs/language/types.md` (primitive `string` and `char`)
- `docs/language/literals-character.md` (shared escape spellings)
- `docs/compiler/abi-libsilk.md` (C ABI string representation)

## Relevant Tests

- Core string equality and ordering:
  - `tests/silk/pass_string_eq.slk`
  - `tests/silk/pass_string_cmp.slk`
- Escape coverage:
  - `tests/silk/pass_string_literal_escapes.slk`
- Raw/backtick coverage:
  - `tests/silk/pass_string_raw_backtick.slk`

The compiler must:

- Implement lexing and parsing for both `"..."` and `` `...` ``.
- Normalize line endings and escapes according to the spec.
- Ensure compatibility with the FFI `SilkString` representation.
