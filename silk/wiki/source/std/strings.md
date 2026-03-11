# `std::strings`

`std::strings` provides utilities and types built on top of the core `string`
type (UTF‑8 bytes), including simple comparisons and owned
string construction.

[Canonical doc](../docs/?p=std/strings).

## Status

- Implemented subset is available; long-term API is still evolving.
- [Details](../docs/?p=std/strings)

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

### Example: equality + optionals
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

- [Canonical doc](../docs/?p=std/strings)
- String literal semantics: [String Literals](../docs/?p=language/literals-string)
- FFI string ABI rules: [External Declarations (ext)](../docs/?p=language/ext)
