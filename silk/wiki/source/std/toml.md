# `std::toml`

`std::toml` provides TOML parsing (initial implementation + expanded subset).

Canonical doc: `docs/std/toml.md`.

## Status

- Implemented subset + design: parsing is implemented; serialization is planned.
- Details: `docs/std/toml.md`

## Importing

```silk
import std::toml;
```

## API (selected)

- `Document.parse(input: string) -> std::toml::ParseResult` (borrowed views into `input`)
- `Document.parse_owned(input: string) -> std::toml::ParseResult` (owned copies)
- `Document.table_get(table: i64, key: string) -> i64?`
- `Document.as_string(id: i64) -> string?`
- `std::toml::int_as_i64(doc: &Document, id: i64) -> i64?`

## Examples

### Works today: parse + query

```silk
import std::toml;

fn main () -> int {
  let mut doc: Document = Document{};
  let input: string = `title = "TOML Example"
answer = 42
`;

  let root_r: std::toml::ParseResult = doc.parse(input);
  if root_r.is_err() {
    doc.drop();
    return 1;
  }
  if !doc.is_ok() {
    doc.drop();
    return 2;
  }
  let root: i64 = match (root_r) {
    Ok(v) => v,
    Err(_) => 0 as i64,
  };

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
}
```

## See also

- Canonical doc: `docs/std/toml.md`
- End-to-end fixture: `tests/silk/pass_std_toml_basic.slk`
