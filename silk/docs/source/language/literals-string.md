# String Literals

String literals represent `string` values: immutable, length-tracked sequences of
bytes that are typically interpreted as UTF-8 text.

Use strings for:

- filenames and paths,
- user-visible messages,
- structured formats (JSON, CSV, etc),
- and general “text” data.

If you need a single Unicode scalar value, use `char` literals
([literals character](?p=language/literals-character)).

## Notes

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
 - `\r` escapes are normalized to `\n`.
- Equality and ordering comparisons (`==`, `!=`, `<`, `<=`, `>`, `>=`) over
 `string` values in the Supported forms.
- Compile-time file embedding with `#embed("path")`, text encodings
 `#embed("path", "utf8")` / `#embed("path", "utf16")`, and integer array
 encodings `#embed("path", "u8")` / `#embed("path", "u16")` /
 `#embed("path", "u32")`.

Not implemented yet (or not specified as stable):

- A stable, fully-specified string ABI story across the C boundary beyond what
 is documented in [abi libsilk](?p=compiler/abi-libsilk).

## Semantics

- The value of a string literal is a sequence of bytes.
- By convention and by intent, `string` values represent UTF-8 text, but some
 escape forms (notably `\xNN`) can construct byte sequences that are not valid
 UTF-8. Avoid this unless you are intentionally working with raw bytes.
- String literals are immutable.
- Literal storage has static program lifetime. Evaluating a comparison does not
 consume, clear, or otherwise invalidate either string operand, and the same
 literal or string binding may be compared again after short-circuit boolean
 expressions and value-position conditionals.
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

Style guidance:

- Prefer raw multiline backtick strings for static multiline text that does not
 need escape processing. This keeps the source text visually aligned with the
 produced bytes and avoids dense `\n` escape runs.
- Use quoted multiline strings when the literal also needs escape processing.
- Use `\n` escapes for single newline bytes, compact generated fragments,
 escape-focused tests, or formats that require a literal backslash followed by
 `n`.

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
- Should be written as raw multiline backtick strings when the text is static
 and does not need escape processing.

## Line Ending Normalization

When decoding string literals, the compiler must normalize:

- `\r\n` to `\n`
- `\r` to `\n`

This applies both to embedded newlines in multi-line literals and to escaped
forms such as `\r`.

Note: a sequence of two escapes like `"\r\n"` is still two escapes. In Silk,
`\r` escapes become `\n`, so `"\r\n"` produces two line
feed bytes (`"\n\n"`).

## Compile-Time File Embedding

`#embed(filepath[, encoding])` reads a file during parsing and embeds its
contents into the compiled program.

- `#embed("relative/path.txt")` resolves the path relative to the containing
 `.slk` source file, validates the file as UTF-8, and produces a `string`.
 This is equivalent to `#embed("relative/path.txt", "utf8")`.
- `#embed("path", "utf8")` validates the file as UTF-8 and produces a
 `string` containing those bytes.
- `#embed("path", "utf16")` decodes UTF-16LE/UTF-16BE input, using a BOM when
 present, and produces a UTF-8 `string`.
- `#embed("path", "u8")`, `#embed("path", "u16")`, and
 `#embed("path", "u32")` produce compiler-owned array values for array-typed
 bindings such as `let bytes: u8[] = #embed("./data.bin", "u8");`. Multi-byte
 integer encodings read little-endian element values; the frontend carries
 file bytes as embed metadata instead of expanding the payload into
 source-level integer literal nodes.
- If no expected array type is present, a raw integer embed infers a dynamic
 slice (`u8[]`, `u16[]`, or `u32[]`) backed by compiler-owned read-only data.

The compiler rejects empty paths, unreadable paths, invalid UTF-8 text embeds,
malformed UTF-16 text embeds, and integer encodings whose file byte length is
not divisible by the requested element width. Embedded strings do not receive
an implicit NUL terminator; `sizeof(value)` reports the embedded byte length.
Use the `u8` encoding for raw byte payloads that are not valid UTF-8 text.

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

### Raw multiline string literal (preferred for static multiline text)

```silk
fn main () -> int {
  let multi: string = `a
b`;

  // Equivalent to using a `\n` escape.
  if multi != "a\nb" {
    return 1;
  }

  return 0;
}
```

### Quoted multi-line string literal (when escapes are needed)

```silk
fn main () -> int {
  let multi: string = "a
b";
  if multi != "a\nb" {
    return 1;
  }

  // Backslashes are literal bytes in raw strings, so escape-focused code may
  // still need quoted strings for comparison.
  if `a\nb` != "a\\nb" { return 2; }

  return 0;
}
```

### Embedded adjacent file

```silk
let shader_source: string = #embed("shader.metal");

fn main () -> int {
  if sizeof(shader_source) > 0 {
    return 0;
  }
  return 1;
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

- [types](?p=language/types) (primitive `string` and `char`)
- [literals character](?p=language/literals-character) (shared escape spellings)
- [abi libsilk](?p=compiler/abi-libsilk) (C ABI string representation)
