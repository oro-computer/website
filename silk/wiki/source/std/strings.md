# `std::strings`

`std::strings` provides utilities and types built on top of the core `string`
type (UTF‑8 bytes), including simple comparisons and owned
string construction.

Canonical doc: `docs/std/strings.md`.

## Status

- Implemented subset is available; long-term API is still evolving.
- Details: `docs/std/strings.md`

## Importing

```silk
import std::strings;
```

## API (Implemented subset)

```silk
module std::strings;

export fn eq (a: string, b: string) -> bool;
export fn is_empty (s: string) -> bool;
export fn or_empty (s: string?) -> string;
```

## Examples

### Works today: equality + optionals

```silk
import std::strings;

fn main () -> int {
  let a: string = "hi";
  let b: string? = None;

  if std::strings::eq(a, "hi") && std::strings::is_empty(std::strings::or_empty(b)) {
    return 0;
  }
  return 1;
}
```

## See also

- Canonical doc: `docs/std/strings.md`
- String literal semantics: `docs/language/literals-string.md`
- FFI string ABI rules: `docs/language/ext.md`
