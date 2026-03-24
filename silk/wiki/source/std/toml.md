# `std::toml`

`std::toml` provides TOML parsing.

Full reference: `docs/std/toml.md`.

## Notes

- Full reference: `docs/std/toml.md`

## Importing

```silk
import std::toml;
```

## Exported API

- `Document.parse(input: string) -> std::toml::ParseResult` (borrowed views into `input`)
- `Document.parse_owned(input: string) -> std::toml::ParseResult` (owned copies)
- `Document.table_get(table: i64, key: string) -> i64?`
- `Document.as_string(id: i64) -> string?`
- `std::toml::int_as_i64(doc: &Document, id: i64) -> i64?`

## Examples

### Example: parse + query
```silk
import std::toml;

fn main () -> int {
  let mut doc: Document = Document{};
  let input: string = `title = "TOML Example"
answer = 42
`;

  match (doc.parse(input)) {
    Ok(root) => {
      if !doc.is_ok() {
        doc.drop();
        return 2;
      }

      let title_id_opt = doc.table_get(root, "title");
      if title_id_opt == None {
        doc.drop();
        return 3;
      }
      let title_id: i64 = title_id_opt ?? 0 as i64;
      let title_opt = doc.as_string(title_id);
      if title_opt == None {
        doc.drop();
        return 4;
      }
      if (title_opt ?? "") != "TOML Example" {
        doc.drop();
        return 5;
      }

      let answer_id_opt = doc.table_get(root, "answer");
      if answer_id_opt == None {
        doc.drop();
        return 6;
      }
      let answer_id: i64 = answer_id_opt ?? 0 as i64;
      let answer_opt = std::toml::int_as_i64(doc, answer_id);
      if answer_opt == None {
        doc.drop();
        return 7;
      }
      if (answer_opt ?? 0 as i64) != 42 {
        doc.drop();
        return 8;
      }

      doc.drop();
      return 0;
    },
    Err(_) => {
      doc.drop();
      return 1;
    },
  }
}
```

## See also

- Full reference: `docs/std/toml.md`
