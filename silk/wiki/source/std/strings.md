# `std::strings`

`std::strings` provides utilities and types built on top of the core `string`
type (UTF‑8 bytes), including simple comparisons and owned
string construction.

Canonical doc: [strings](?p=std/strings).

## Notes

- Supported forms is available; long-term API is still evolving.
- Details: [strings](?p=std/strings)

## Importing

```silk
import std::strings;
```

## Exported API

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

- Canonical doc: [strings](?p=std/strings)
- String literal semantics: [literals string](?p=language/literals-string)
- FFI string ABI rules: [ext](?p=language/ext)
