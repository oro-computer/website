# `std::toml`

Status: **Implemented subset**.

`std::toml` provides a TOML v1.0-style parser over an index-based DOM.

## Exported API

```silk
module std::toml;

export type ValueId = i64;
export type ParseResult = std::result::Result(ValueId, ParseError);

error ParseError {
  kind: int,
  offset: i64,
  line: i64,
  column: i64,
}

struct Document {
  root: ValueId,
  err: ParseError,
}

impl Document {
  public fn is_ok (self: &Document) -> bool;
  public fn root_value (self: &Document) -> ValueId?;

  public fn parse (mut self: &Document, s: string) -> ParseResult;
  public fn parse_owned (mut self: &Document, s: string) -> ParseResult;

  public fn tag (self: &Document, id: ValueId) -> int?;
  public fn as_bool (self: &Document, id: ValueId) -> bool?;
  public fn as_string (self: &Document, id: ValueId) -> string?;
  public fn as_int_lexeme (self: &Document, id: ValueId) -> string?;
  public fn as_float_lexeme (self: &Document, id: ValueId) -> string?;
  public fn as_datetime_lexeme (self: &Document, id: ValueId) -> string?;
  public fn int_as_i64 (self: &Document, id: ValueId) -> i64?;
  public fn float_as_f64 (self: &Document, id: ValueId) -> f64?;

  public fn array_len (self: &Document, id: ValueId) -> i64?;
  public fn array_first (self: &Document, id: ValueId) -> ValueId?;
  public fn next_sibling (self: &Document, id: ValueId) -> ValueId?;

  public fn table_len (self: &Document, id: ValueId) -> i64?;
  public fn table_first_member (self: &Document, id: ValueId) -> ValueId?;
  public fn member_key (self: &Document, member: ValueId) -> string?;
  public fn member_value (self: &Document, member: ValueId) -> ValueId?;
  public fn member_next (self: &Document, member: ValueId) -> ValueId?;
  public fn table_get (self: &Document, table: ValueId, key: string) -> ValueId?;
}

export fn int_as_i64 (doc: &Document, id: ValueId) -> i64?;
export fn float_as_f64 (doc: &Document, id: ValueId) -> f64?;
export fn error_message (kind: int) -> string;
```

Notes:

- The exported free functions are thin compatibility wrappers around the
  corresponding `Document` methods.
- Tables and arrays are stored as linked lists over `ValueId` indices to match
  the current compiler subset.
- The internal DOM storage now uses the shared
  `std::formal::index_dom_storage_well_formed` contract, and the public
  document accessors attach that theory directly.

## Examples

```silk
import std::toml;

fn main () -> int {
  let mut doc: Document = Document{};

  match (doc.parse(`
title = "silk"
ports = [8000, 8001]
pi = 3.14
`)) {
    Ok(root) => {
      let title_id = doc.table_get(root, "title") ?? 0 as i64;
      let ports_id = doc.table_get(root, "ports") ?? 0 as i64;
      let first = doc.array_first(ports_id) ?? 0 as i64;
      let pi_id = doc.table_get(root, "pi") ?? 0 as i64;

      if doc.as_string(title_id) != Some("silk") { return 2; }
      if doc.int_as_i64(first) != Some(8000 as i64) { return 3; }

      let pi = doc.float_as_f64(pi_id) ?? 0.0;
      if pi <= 3.0 { return 4; }
      if pi >= 4.0 { return 5; }
      return 0;
    },
    Err(_) => {
      return 1;
    },
  }
}
```

## Considerations

### Ownership and parse modes

- `Document` is the owning TOML DOM container.
- `ValueId` is the stable handle for values inside a `Document`.
- Parsing is explicit about ownership:
  - `doc.parse(s)` borrows simple strings and numeric/datetime lexemes from `s`,
  - `doc.parse_owned(s)` copies strings and lexemes into `doc`.
- `Document` intentionally does not implement `Serialize(string)` or
  `Parse(E, string)`:
  - TOML text is a structured format, not the plain textual identity of the
    DOM,
  - and borrowed versus owned parsing is an explicit choice that should remain
    visible at the call site.

### String, numeric, and datetime values

Supported string forms:

- basic strings (`"..."`) with TOML escapes,
- literal strings (`'...'`) without escape processing,
- multiline basic and multiline literal strings.

Value access follows the parsed TOML shape:

- `doc.as_string(id)` returns the decoded string value,
- `doc.as_int_lexeme(id)` / `doc.as_float_lexeme(id)` preserve the original
  numeric spelling,
- `doc.int_as_i64(id)` and `doc.float_as_f64(id)` interpret the stored lexeme,
- `doc.as_datetime_lexeme(id)` returns the original datetime token spelling.

The returned `string` values are borrowed views into either the original input
buffer or storage owned by `doc`.

### Error and lifetime behavior

`doc.parse(s)` is the fast path:

- simple strings may point into `s`,
- numeric and datetime lexemes may point into `s`,
- escaped strings are decoded into allocations tracked by `doc`.

`doc.parse_owned(s)` copies strings and lexemes into `doc`, so the parsed
document remains valid even after `s` is no longer needed.

Both methods:

- clear the document before parsing,
- return `Ok(root)` on success and `Err(ParseError)` on failure,
- update `doc.root` / `doc.err`,
- and report out-of-memory as `ERR_OUT_OF_MEMORY`.

## See also

- [`std::json`](?p=std/json)
- [`std::strings`](?p=std/strings)
- [`std::temporal`](?p=std/temporal)

## Design goals

- Streaming tokenization for very large inputs.
- Canonical TOML emission once the DOM/query surface is considered stable.
- Rich datetime parsing and integration with `std::temporal`.
