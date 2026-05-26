# `std::toml`

`std::toml` provides a TOML v1.0-style parser plus deterministic emission over
an index-based DOM.

## Design rules

- `Document` is the owning TOML DOM container.
- `ValueId` is the stable handle for values inside a `Document`.
- Parsing is explicit about ownership:
 - `doc.parse(s)` borrows simple strings and numeric/datetime lexemes from `s`,
 - `doc.parse_owned(s)` copies strings and lexemes into `doc`.
- TOML construction and emission are explicit:
 - `doc.new_*()` allocates owned TOML values inside the document,
 - `doc.array_append(...)` and `doc.table_put(...)` link them into arrays and
 tables,
 - `doc.set_root_value(id)` marks a built table as the document root,
 - `doc.stringify(id)` renders deterministic TOML text.
- `Document` intentionally does not implement `Serialize(string)` or
 `Parse(E, string)`:
 - TOML text is a structured format, not the plain textual identity of the
 DOM,
 - and borrowed versus owned parsing is an explicit choice that should remain
 visible at the call site.

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
  public fn set_root_value (mut self: &Document, id: ValueId) -> bool;

  public fn parse (mut self: &Document, s: string) -> ParseResult;
  public fn parse_owned (mut self: &Document, s: string) -> ParseResult;

  public fn new_string (mut self: &Document, s: string) -> ValueId?;
  public fn new_bool (mut self: &Document, value: bool) -> ValueId?;
  public fn new_int_i64 (mut self: &Document, value: i64) -> ValueId?;
  public fn new_float_lexeme (mut self: &Document, s: string) -> ValueId?;
  public fn new_datetime_lexeme (mut self: &Document, s: string) -> ValueId?;
  public fn new_array (mut self: &Document) -> ValueId?;
  public fn array_append (mut self: &Document, array: ValueId, value: ValueId) -> bool;
  public fn array_append_bool (mut self: &Document, array: ValueId, value: bool) -> bool;
  public fn array_append_string (mut self: &Document, array: ValueId, value: string) -> bool;
  public fn array_append_int_i64 (mut self: &Document, array: ValueId, value: i64) -> bool;
  public fn array_append_float_lexeme (mut self: &Document, array: ValueId, value: string) -> bool;
  public fn array_append_datetime_lexeme (mut self: &Document, array: ValueId, value: string) -> bool;
  public fn array_append_new_array (mut self: &Document, array: ValueId) -> ValueId?;
  public fn array_append_new_table (mut self: &Document, array: ValueId) -> ValueId?;
  public fn new_table (mut self: &Document) -> ValueId?;
  public fn table_put (mut self: &Document, table: ValueId, key: string, value: ValueId) -> bool;
  public fn table_put_bool (mut self: &Document, table: ValueId, key: string, value: bool) -> bool;
  public fn table_put_string (mut self: &Document, table: ValueId, key: string, value: string) -> bool;
  public fn table_put_int_i64 (mut self: &Document, table: ValueId, key: string, value: i64) -> bool;
  public fn table_put_float_lexeme (mut self: &Document, table: ValueId, key: string, value: string) -> bool;
  public fn table_put_datetime_lexeme (mut self: &Document, table: ValueId, key: string, value: string) -> bool;
  public fn table_put_new_array (mut self: &Document, table: ValueId, key: string) -> ValueId?;
  public fn table_put_new_table (mut self: &Document, table: ValueId, key: string) -> ValueId?;

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
  public fn stringify (self: &Document, id: ValueId) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
}

export fn int_as_i64 (doc: &Document, id: ValueId) -> i64?;
export fn float_as_f64 (doc: &Document, id: ValueId) -> f64?;
export fn stringify (doc: &Document, id: ValueId) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn error_message (kind: int) -> string;
```

Notes:

- The exported free functions are thin compatibility wrappers around the
 corresponding `Document` methods.
- Tables and arrays are stored as linked lists over `ValueId` indices to match
 Silk currently.
- The internal DOM storage now uses a private
 `std::toml::dom_storage_well_formed(...)` theory defined inside
 `std/toml.slk`, and the public document accessors attach that local contract
 directly.
 This theory is intentionally not exported because it describes the current
 TOML DOM table layout rather than a stable downstream abstraction.

## String, numeric, and datetime values

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

## Borrowed vs owned parse

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

## DOM construction and emission

`Document` can also be built directly instead of parsed from text.

- `doc.new_string(...)`, `doc.new_bool(...)`, `doc.new_int_i64(...)`,
 `doc.new_float_lexeme(...)`, and `doc.new_datetime_lexeme(...)` allocate
 owned scalar TOML values inside `doc`.
- `doc.new_array()` and `doc.new_table()` allocate empty containers.
- `doc.array_append(...)` keeps arrays homogeneous and rejects invalid parents,
 duplicate-parent reuse, and obvious cycle creation.
- `doc.table_put(...)` enforces unique keys, rejects invalid parents, and keeps
 insertion order stable for deterministic emission.
- `doc.array_append_*` and `doc.table_put_*` convenience helpers allocate the
 child value and link it in one step for the common scalar cases.
- `doc.array_append_new_array(...)`, `doc.array_append_new_table(...)`,
 `doc.table_put_new_array(...)`, and `doc.table_put_new_table(...)`
 allocate and link nested containers, then return the linked child id so
 downstream code can keep building without a separate temporary/link pair.
- `doc.set_root_value(id)` only accepts table values because TOML documents are
 table-rooted.
- `doc.stringify(id)` renders deterministic TOML:
 - the root table is emitted as top-level `key = value` lines,
 - nested tables are emitted as inline tables,
 - arrays preserve insertion order.

## Example

```silk
import std::toml;

fn main () -> int {
  let mut doc: Document = Document{};

  let root_r = doc.parse(`
title = "silk"
ports = [8000, 8001]
pi = 3.14
`);
  if root_r.is_err() {
    return 1;
  }

  let root: i64 = match (root_r) {
    Ok(v) => v,
    Err(_) => 0 as i64,
  };

  let title_id_opt = doc.table_get(root, "title");
  if title_id_opt == None {
    return 2;
  }
  let title_id: i64 = title_id_opt ?? 0 as i64;
  if (doc.as_string(title_id) ?? "") != "silk" {
    return 3;
  }

  let ports_id_opt = doc.table_get(root, "ports");
  if ports_id_opt == None {
    return 4;
  }
  let ports_id: i64 = ports_id_opt ?? 0 as i64;
  let first_opt = doc.array_first(ports_id);
  if first_opt == None {
    return 5;
  }
  let first: i64 = first_opt ?? 0 as i64;
  if (doc.int_as_i64(first) ?? 0 as i64) != 8000 {
    return 6;
  }

  let pi_id_opt = doc.table_get(root, "pi");
  if pi_id_opt == None {
    return 7;
  }
  let pi_id: i64 = pi_id_opt ?? 0 as i64;
  let pi_opt = doc.float_as_f64(pi_id);
  if pi_opt == None {
    return 8;
  }
  let pi: f64 = pi_opt ?? 0.0;
  if pi <= 3.0 {
    return 9;
  }
  if pi >= 4.0 {
    return 10;
  }

  return 0;
}
```

Construction and emission example:

```silk
import std::toml;

fn main () -> int {
  let mut doc: Document = Document{};

  let root_opt = doc.new_table();
  if root_opt == None {
    return 1;
  }

  let root: i64 = root_opt ?? 0 as i64;
  if !doc.set_root_value(root) {
    return 2;
  }

  let title_opt = doc.new_string("silk");
  if title_opt == None {
    return 3;
  }

  if !doc.table_put(root, "title", title_opt ?? 0 as i64) {
    return 4;
  }

  let out_r = doc.stringify(root);
  match (out_r) {
    Ok(mut out) => {
      let ok: bool = out.as_string() == `"title" = "silk"`;
      out.drop();
      if !ok {
        return 5;
      }
      return 0;
    },
    Err(_) => {
      return 6;
    },
  }
}
```

Serializing a custom type with the convenience helpers:

```silk
import std::toml;

struct Config {
  title: string,
  port: i64,
  enabled: bool,
}

impl Config {
  public fn append_toml (self: &Config, mut doc: &Document) -> i64? {
    let root_opt = doc.new_table();
    if root_opt == None {
      return None;
    }

    let root: i64 = root_opt ?? 0 as i64;
    if !doc.table_put_string(root, "title", self.title) {
      return None;
    }
    if !doc.table_put_int_i64(root, "port", self.port) {
      return None;
    }
    if !doc.table_put_bool(root, "enabled", self.enabled) {
      return None;
    }

    let tags_opt = doc.table_put_new_array(root, "tags");
    if tags_opt == None {
      return None;
    }

    let tags: i64 = tags_opt ?? 0 as i64;
    if !doc.array_append_string(tags, "cli") {
      return None;
    }
    if !doc.array_append_string(tags, "chat") {
      return None;
    }

    return Some(root);
  }
}
```

## Considerations
- Streaming tokenization for very large inputs.
- Pretty TOML emission once the deterministic writer surface settles.
- Rich datetime parsing and integration with `std::temporal`.
