# `std::json`

`std::json` provides an implemented JSON parsing and stringifying subset.

Canonical doc: `docs/std/json.md`.

## Status

- Implemented subset + design: parsing and stringify are implemented; the DOM/query surface is still evolving.
- Details: `docs/std/json.md`

## Importing

```silk
import std::json;
import std::strings;
```

## API (selected)

- `Document.parse(input: string) -> std::json::ParseResult` (borrowed views into `input`)
- `Document.parse_owned(input: string) -> std::json::ParseResult` (owned copies)
- `Document.object_get(obj: i64, key: string) -> i64?`
- `Document.as_string(id: i64) -> string?`
- `Document.as_number_lexeme(id: i64) -> string?`
- `std::json::number_as_i64(doc: &Document, id: i64) -> i64?`
- `std::json::stringify(doc: &Document, id: i64) -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`
- `std::json::stringify_pretty(doc: &Document, id: i64, indent: int) -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`

## Examples

### Example: parse + query + stringify
```silk
import std::json;
import std::strings;
import std::result;
import std::memory;

type StringAllocResult = std::result::Result(std::strings::String, std::memory::OutOfMemory);

fn main () -> int {
  let mut doc: Document = Document{};
  let input: string = `{"a":1,"b":true,"c":null,"d":["x","y"],"u":"\u0041"}`;

  let root = match doc.parse(input) {
    Ok(v) => v,
    Err(_) => {
      doc.drop();
      return 1;
    },
  };
  if !doc.is_ok() {
    doc.drop();
    return 2;
  }

  let Some(u_id) = doc.object_get(root, "u") else {
    doc.drop();
    return 3;
  };
  let Some(u) = doc.as_string(u_id) else {
    doc.drop();
    return 4;
  };
  if u != "A" {
    doc.drop();
    return 5;
  }

  let Some(a_id) = doc.object_get(root, "a") else {
    doc.drop();
    return 6;
  };
  let Some(a_num) = std::json::number_as_i64(doc, a_id) else {
    doc.drop();
    return 7;
  };
  if a_num != 1 {
    doc.drop();
    return 8;
  }

  let mut compact = match std::json::stringify(doc, root) {
    StringAllocResult::Ok(v) => v,
    StringAllocResult::Err(_) => {
      doc.drop();
      return 9;
    },
  };
  let expected: string = `{"a":1,"b":true,"c":null,"d":["x","y"],"u":"A"}`;
  if compact.as_string() != expected {
    compact.drop();
    doc.drop();
    return 10;
  }

  compact.drop();
  doc.drop();
  return 0;
}
```

## See also

- Canonical doc: `docs/std/json.md`
- Typed results and errors: `docs/std/result.md`
