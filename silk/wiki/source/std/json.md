# `std::json`

`std::json` provides JSON parsing and stringifying (initial implementation + expanded
subset).

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

  match (doc.parse(input)) {
    Ok(root) => {
      if !doc.is_ok() {
        doc.drop();
        return 2;
      }

      let u_id_opt = doc.object_get(root, "u");
      if u_id_opt == None {
        doc.drop();
        return 3;
      }
      let u_id: i64 = u_id_opt ?? 0 as i64;
      let u_opt = doc.as_string(u_id);
      if u_opt == None {
        doc.drop();
        return 4;
      }
      if (u_opt ?? "") != "A" {
        doc.drop();
        return 5;
      }

      let a_id_opt = doc.object_get(root, "a");
      if a_id_opt == None {
        doc.drop();
        return 6;
      }
      let a_id: i64 = a_id_opt ?? 0 as i64;
      let a_num_opt = std::json::number_as_i64(doc, a_id);
      if a_num_opt == None {
        doc.drop();
        return 7;
      }
      if (a_num_opt ?? 0 as i64) != 1 {
        doc.drop();
        return 8;
      }

      match (std::json::stringify(doc, root)) {
        StringAllocResult::Ok(compact_value) => {
          let mut compact: std::strings::String = compact_value;
          let expected: string = `{"a":1,"b":true,"c":null,"d":["x","y"],"u":"A"}`;
          if compact.as_string() != expected {
            compact.drop();
            doc.drop();
            return 10;
          }

          compact.drop();
          doc.drop();
          return 0;
        },
        StringAllocResult::Err(_) => {
          doc.drop();
          return 9;
        },
      }
    },
    Err(_) => {
      doc.drop();
      return 1;
    },
  }
}
```

## See also

- Canonical doc: `docs/std/json.md`
- End-to-end fixture: `tests/silk/pass_std_json_basic.slk`
