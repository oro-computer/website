# `std::json`

`std::json` provides an RFC 8259 parser, an index-based DOM, and compact or
pretty JSON stringification for Silk programs.

## Exported API

### Value ids and tags

- `ValueId = i64` — stable node id used to refer to a parsed JSON value inside
  a `Document`.
- `TAG_NULL`
- `TAG_BOOL`
- `TAG_NUMBER`
- `TAG_STRING`
- `TAG_ARRAY`
- `TAG_OBJECT`

Use `doc.tag(id)` when you need to branch on the concrete JSON kind before
querying a value.

### Parse errors

`ParseError` describes parser failures:

- `kind: int`
- `offset: i64` — byte offset into the input
- `line: i64` — 1-based line
- `column: i64` — 1-based column

Methods:

- `ParseError.ok() -> ParseError`
- `err.is_ok() -> bool`

Exported error constants:

- `ERR_NONE`
- `ERR_UNEXPECTED_EOF`
- `ERR_UNEXPECTED_TOKEN`
- `ERR_INVALID_STRING`
- `ERR_INVALID_ESCAPE`
- `ERR_INVALID_UNICODE_ESCAPE`
- `ERR_INVALID_NUMBER`
- `ERR_TRAILING_INPUT`
- `ERR_DEPTH_LIMIT`
- `ERR_OUT_OF_MEMORY`

Helpers:

- `ParseResult = std::result::Result(ValueId, ParseError)`
- `error_message(kind: int) -> string`

### `Document`

`Document` owns the parsed DOM plus any allocations needed for decoded strings
or owned-number lexemes. Construct it with `Document{}`. It implements
`std::interfaces::Drop`.

Lifecycle methods:

- `doc.is_ok() -> bool`
- `doc.root_value() -> ValueId?`
- `doc.clear() -> void`
- `doc.drop() -> void`
- `doc.parse(input: string) -> ParseResult`
- `doc.parse_owned(input: string) -> ParseResult`

`parse` borrows unescaped strings and number lexemes from the input.
`parse_owned` copies them into storage owned by the document.

### Query and traversal

Primitive accessors:

- `doc.tag(id) -> int?`
- `doc.is_null(id) -> bool`
- `doc.as_bool(id) -> bool?`
- `doc.as_string(id) -> string?`
- `doc.as_number_lexeme(id) -> string?`

Array traversal:

- `doc.array_len(id) -> i64?`
- `doc.array_first(id) -> ValueId?`
- `doc.next_sibling(id) -> ValueId?`

Object traversal:

- `doc.object_len(id) -> i64?`
- `doc.object_first_member(id) -> ValueId?`
- `doc.member_key(member) -> string?`
- `doc.member_value(member) -> ValueId?`
- `doc.member_next(member) -> ValueId?`
- `doc.object_get(obj, key: string) -> ValueId?`

### Numeric and formatting helpers

Methods:

- `doc.number_as_i64(id) -> i64?`
- `doc.number_as_f64(id) -> f64?`
- `doc.stringify(id) -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`
- `doc.stringify_pretty(id, indent: int) -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`

Top-level wrappers:

- `number_as_i64(doc: &Document, id: ValueId) -> i64?`
- `number_as_f64(doc: &Document, id: ValueId) -> f64?`
- `stringify(doc: &Document, id: ValueId) -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`
- `stringify_pretty(doc: &Document, id: ValueId, indent: int) -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`

## Examples

### Parse and query a document

```silk
import std::json;

fn main () -> int {
  let mut doc: Document = Document{};
  let root = match doc.parse(`{"name":"oro","ports":[80,443],"tls":true}`) {
    Ok(v) => v,
    Err(err) => {
      let _message: string = std::json::error_message(err.kind);
      return 1;
    }
  };

  let ports = match doc.object_get(root, "ports") {
    Some(v) => v,
    None => return 2,
  };
  let first = match doc.array_first(ports) {
    Some(v) => v,
    None => return 3,
  };
  if doc.number_as_i64(first) != Some(80) {
    return 4;
  }

  let pretty = match doc.stringify_pretty(root, 2) {
    Ok(v) => v,
    Err(_) => return 5,
  };
  if pretty.as_string() == "" {
    return 6;
  }

  return 0;
}
```

### Own parsed strings instead of borrowing from the input

```silk
import std::json;

fn main () -> int {
  let mut doc: Document = Document{};
  let root = match doc.parse_owned(`{"service":"runtime","region":"edge-a"}`) {
    Ok(v) => v,
    Err(_) => return 1,
  };

  let service = match doc.object_get(root, "service") {
    Some(v) => v,
    None => return 2,
  };
  if doc.as_string(service) != Some("runtime") {
    return 3;
  }

  return 0;
}
```

## Considerations

- `parse` is the fast path when the input buffer already outlives the document.
  Use `parse_owned` when you need the parsed strings and number lexemes to stay
  valid independently of the original input.
- `ValueId` is meaningful only for the `Document` that produced it. Do not mix
  ids across documents.
- `doc.clear()` and `doc.drop()` invalidate all previously returned `ValueId`
  handles and all borrowed `string` views obtained from the document.
- Numbers are preserved as source lexemes. Use `number_as_i64` or
  `number_as_f64` only when you need numeric interpretation.
- The DOM uses index tables rather than nested reference fields. That is an
  implementation detail, but it explains why traversal is done with `ValueId`
  and sibling/member helpers instead of borrowed node references.

## See also

- [`std::result`](?p=std/result)
- [`std::strings`](?p=std/strings)
- [`std::url`](?p=std/url)
