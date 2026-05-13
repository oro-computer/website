# String literals

`string` is Silk’s built-in UTF‑8 byte sequence type. String literals write a
`string` value directly in source code.

Reference: [string literals](../docs/?p=language/literals-string).

Use strings for paths, messages, protocol text, JSON, and other byte sequences
that are normally interpreted as UTF-8.

## Forms

Double-quoted strings process escapes:

```silk
let one_line: string = "hello\n";
let quoted: string = "quote=\" backslash=\\";
```

Backtick strings are raw and are useful for multiline text:

```silk
let body: string = `line one
line two`;
```

## Example: multiline text and escapes

```silk
import io from "std/io";

fn main () -> int {
  io::println(`line1
line2`);
  io::println("quote=\\\" backslash=\\\\");
  return 0;
}
```

## Escapes

Double-quoted strings support common escapes:

- `\\` backslash
- `\"` double quote
- `\'` single quote
- `\n`, `\r`, `\t`, `\0`
- `\xNN` byte escape
- `\u{...}` Unicode scalar escape

String literals carry their length explicitly; they do not implicitly add a
trailing NUL byte for C.

## When To Use `char`

Use `char` for one Unicode scalar value and `string` for text:

```silk
let slash: char = '/';
let path: string = "/tmp/app";
```

## See also

- Reference: [string literals](../docs/?p=language/literals-string)
- Character literals: [character literals](?p=language/literals-character)
- `std::strings`: [strings](?p=std/strings)
