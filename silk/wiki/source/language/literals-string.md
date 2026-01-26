# String literals

`string` is Silk’s built-in UTF‑8 byte sequence type. String literals write a
`string` value directly in source code.

Canonical doc: `docs/language/literals-string.md`.

## Example (Works today): escapes

```silk
import std::io;

fn main () -> int {
  std::io::println("line1\\nline2");
  std::io::println("quote=\\\" backslash=\\\\");
  return 0;
}
```

## See also

- Canonical doc: `docs/language/literals-string.md`
- `std::strings`: `docs/wiki/std/strings.md`
