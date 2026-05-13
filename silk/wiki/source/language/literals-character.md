# Character literals

`char` represents a Unicode scalar value. Character literals write a `char`
value directly in source code.

Reference: [character literals](../docs/?p=language/literals-character).

## Shape

Character literals use single quotes and must decode to exactly one Unicode
scalar value:

```silk
let letter: char = 'A';
let newline: char = '\n';
let accent: char = '\u{00E9}';
```

Use `string` when you need more than one character.

## Escapes

Common escapes:

- `\n` line feed
- `\r` carriage return
- `\t` tab
- `\0` NUL
- `\\` backslash
- `\'` single quote
- `\"` double quote
- `\xNN` two hex digits
- `\u{...}` Unicode scalar

## Example

```silk
fn main () -> int {
  let a: char = 'A';
  let nl: char = '\\n';
  if a != 'A' { return 1; }
  if nl != '\\n' { return 2; }
  return 0;
}
```

## Practical Use

`char` is useful for parser tokens and single-character delimiters:

```silk
fn is_separator (ch: char) -> bool {
  return ch == ',' || ch == ';' || ch == '\n';
}
```

For user-facing text, prefer `string`; a visible glyph is not always one
Unicode scalar.

## See also

- Reference: [character literals](../docs/?p=language/literals-character)
- String literals: [string literals](?p=language/literals-string)
- Types: [types](?p=language/types)
