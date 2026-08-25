# `std::json`

`std::json` provides an RFC 8259-style JSON parser plus deterministic JSON
emission over an index-based DOM.

## Design rules

- `Document` is the owning JSON DOM container.
- `ValueId` is the stable handle for values inside a `Document`.
- Parsing is explicit about ownership:
 - `doc.parse(s)` borrows unescaped strings and number lexemes from `s`,
 - `doc.parse_owned(s)` copies strings and number lexemes into `doc`.
- JSON emission is explicit:
 - `doc.stringify(id)` emits compact JSON,
 - `doc.stringify_pretty(id, indent)` emits pretty JSON.
- DOM construction is explicit:
 - `doc.new_*()` allocates owned JSON values inside the document,
 - `doc.array_append(...)` and `doc.object_put(...)` link those values into
 arrays and objects,
 - `doc.set_root_value(id)` marks a built value as the document root.
- `Document` intentionally does not implement `Serialize(string)` or
 `Parse(E, string)`:
 - JSON text is a format-specific rendering, not the plain textual identity of
 the DOM,
 - and borrowed parsing requires an explicit ownership choice that a blanket
 `Type.parse(...) -> Self` protocol would hide.

## Exported API

```silk
module std::json;

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

  public fn new_null (mut self: &Document) -> ValueId?;
  public fn new_bool (mut self: &Document, value: bool) -> ValueId?;
  public fn new_string (mut self: &Document, s: string) -> ValueId?;
  public fn new_number_i64 (mut self: &Document, value: i64) -> ValueId?;
  public fn new_number_u64 (mut self: &Document, value: u64) -> ValueId?;
  public fn new_number_lexeme (mut self: &Document, s: string) -> ValueId?;
  public fn new_array (mut self: &Document) -> ValueId?;
  public fn array_append (mut self: &Document, array: ValueId, value: ValueId) -> bool;
  public fn array_append_null (mut self: &Document, array: ValueId) -> bool;
  public fn array_append_bool (mut self: &Document, array: ValueId, value: bool) -> bool;
  public fn array_append_string (mut self: &Document, array: ValueId, value: string) -> bool;
  public fn array_append_number_i64 (mut self: &Document, array: ValueId, value: i64) -> bool;
  public fn array_append_number_u64 (mut self: &Document, array: ValueId, value: u64) -> bool;
  public fn array_append_number_lexeme (mut self: &Document, array: ValueId, value: string) -> bool;
  public fn array_append_new_array (mut self: &Document, array: ValueId) -> ValueId?;
  public fn array_append_new_object (mut self: &Document, array: ValueId) -> ValueId?;
  public fn new_object (mut self: &Document) -> ValueId?;
  public fn object_put (mut self: &Document, obj: ValueId, key: string, value: ValueId) -> bool;
  public fn object_put_null (mut self: &Document, obj: ValueId, key: string) -> bool;
  public fn object_put_bool (mut self: &Document, obj: ValueId, key: string, value: bool) -> bool;
  public fn object_put_string (mut self: &Document, obj: ValueId, key: string, value: string) -> bool;
  public fn object_put_number_i64 (mut self: &Document, obj: ValueId, key: string, value: i64) -> bool;
  public fn object_put_number_u64 (mut self: &Document, obj: ValueId, key: string, value: u64) -> bool;
  public fn object_put_number_lexeme (mut self: &Document, obj: ValueId, key: string, value: string) -> bool;
  public fn object_put_new_array (mut self: &Document, obj: ValueId, key: string) -> ValueId?;
  public fn object_put_new_object (mut self: &Document, obj: ValueId, key: string) -> ValueId?;

  public fn tag (self: &Document, id: ValueId) -> int?;
  public fn is_null (self: &Document, id: ValueId) -> bool;
  public fn as_bool (self: &Document, id: ValueId) -> bool?;
  public fn as_string (self: &Document, id: ValueId) -> string?;
  public fn as_number_lexeme (self: &Document, id: ValueId) -> string?;
  public fn number_as_i64 (self: &Document, id: ValueId) -> i64?;
  public fn number_as_f64 (self: &Document, id: ValueId) -> f64?;

  public fn array_len (self: &Document, id: ValueId) -> i64?;
  public fn array_first (self: &Document, id: ValueId) -> ValueId?;
  public fn next_sibling (self: &Document, id: ValueId) -> ValueId?;

  public fn object_len (self: &Document, id: ValueId) -> i64?;
  public fn object_first_member (self: &Document, id: ValueId) -> ValueId?;
  public fn member_key (self: &Document, member: ValueId) -> string?;
  public fn member_value (self: &Document, member: ValueId) -> ValueId?;
  public fn member_next (self: &Document, member: ValueId) -> ValueId?;
  public fn object_get (self: &Document, obj: ValueId, key: string) -> ValueId?;

  public fn stringify (self: &Document, id: ValueId) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
  public fn stringify_pretty (self: &Document, id: ValueId, indent: int) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
}

export fn number_as_i64 (doc: &Document, id: ValueId) -> i64?;
export fn number_as_f64 (doc: &Document, id: ValueId) -> f64?;
export fn stringify (doc: &Document, id: ValueId) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn stringify_pretty (doc: &Document, id: ValueId, indent: int) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn error_message (kind: int) -> string;
```

Notes:

- The exported free functions are thin compatibility wrappers around the
 corresponding `Document` methods.
- Arrays and objects are stored as linked lists over `ValueId` indices because
 Silk currently does not yet support the reference-rich layout a
 pointer-based DOM would want.
- The internal DOM storage now uses a private
 `std::json::dom_storage_well_formed(...)` theory defined inside
 `std/json.slk`, and the public document accessors attach that local contract
 directly.
 This theory is intentionally not exported because it describes the current
 JSON DOM table layout rather than a stable downstream abstraction.

## Borrowed vs owned parse

`doc.parse(s)` is the fast path:

- unescaped strings are borrowed directly from `s`,
- number lexemes are borrowed directly from `s`,
- escaped strings are decoded into allocations tracked by `doc`.

`doc.parse_owned(s)` copies string and number storage into `doc`, so the parsed
document remains valid even after `s` is no longer needed.

Both methods:

- clear the document before parsing,
- return `Ok(root)` on success and `Err(ParseError)` on failure,
- update `doc.root` / `doc.err`,
- and report out-of-memory as `ERR_OUT_OF_MEMORY`.

## DOM construction

`Document` can also be built directly instead of parsed from text.

- `doc.new_null()`, `doc.new_bool(...)`, `doc.new_string(...)`,
 `doc.new_number_i64(...)`, `doc.new_number_u64(...)`, and
 `doc.new_number_lexeme(...)` allocate owned leaf values inside `doc`.
- `doc.new_array()` and `doc.new_object()` allocate empty container values.
- `doc.array_append(...)` and `doc.object_put(...)` link an existing value into
 a container and reject invalid parents, invalid child ids, duplicate-parent
 reuse, and obvious cycle creation.
- `doc.array_append_*` and `doc.object_put_*` convenience helpers allocate the
 child value and link it in one step for the common scalar cases.
- `doc.array_append_new_array(...)`, `doc.array_append_new_object(...)`,
 `doc.object_put_new_array(...)`, and `doc.object_put_new_object(...)`
 allocate and link nested containers, then return the linked child id so
 downstream code can keep building without a separate temporary/link pair.
- `doc.set_root_value(id)` marks a built value as the root so `doc.is_ok()` and
 `doc.root_value()` work the same way as after parsing.

Construction ownership rules:

- Built strings and number lexemes are copied into storage owned by `doc`.
- A value can only belong to one array/object parent.
- Reusing the same value under multiple parents is rejected.
- Container cycles are rejected.

## String and number access

- `doc.as_string(id)` returns the decoded JSON string view for a string node.
- `doc.as_number_lexeme(id)` returns the original number lexeme.
- `doc.number_as_i64(id)` succeeds only when the number was recognized as an
 exact `i64`.
- `doc.number_as_f64(id)` reparses the stored lexeme as `f64`.

The returned `string` values are borrowed views into either the original input
buffer or storage owned by `doc`.

## Example

```silk
import std::json;

fn main () -> int {
  let mut doc: Document = Document{};

  let root_r = doc.parse(`{"name":"silk","answer":42}`);
  if root_r.is_err() {
    return 1;
  }

  let root: i64 = match (root_r) {
    Ok(v) => v,
    Err(_) => 0 as i64,
  };

  let name_id_opt = doc.object_get(root, "name");
  if name_id_opt == None {
    return 2;
  }
  let name_id: i64 = name_id_opt ?? 0 as i64;
  if (doc.as_string(name_id) ?? "") != "silk" {
    return 3;
  }

  let answer_id_opt = doc.object_get(root, "answer");
  if answer_id_opt == None {
    return 4;
  }
  let answer_id: i64 = answer_id_opt ?? 0 as i64;
  if (doc.number_as_i64(answer_id) ?? 0 as i64) != 42 {
    return 5;
  }

  let out_r = doc.stringify(root);
  match (out_r) {
    Ok(mut out) => {
      let s: string = out as string;
      out.drop();
      if s != `{"name":"silk","answer":42}` {
        return 6;
      }
      return 0;
    },
    Err(_) => {
      return 7;
    },
  }
}
```

Construction example:

```silk
import std::json;

fn main () -> int {
  let mut doc: Document = Document{};

  let root_opt = doc.new_object();
  if root_opt == None {
    return 1;
  }

  let root: i64 = root_opt ?? 0 as i64;
  if !doc.set_root_value(root) {
    return 2;
  }

  let items_opt = doc.new_array();
  if items_opt == None {
    return 3;
  }

  let items: i64 = items_opt ?? 0 as i64;
  if !doc.object_put(root, "items", items) {
    return 4;
  }

  let one_opt = doc.new_number_i64(1);
  if one_opt == None {
    return 5;
  }

  if !doc.array_append(items, one_opt ?? 0 as i64) {
    return 6;
  }

  let out_r = doc.stringify(root);
  match (out_r) {
    Ok(mut out) => {
      let ok: bool = out.as_string() == `{"items":[1]}`;
      out.drop();
      if !ok {
        return 7;
      }
      return 0;
    },
    Err(_) => {
      return 8;
    },
  }
}
```

Serializing a custom type with the convenience helpers:

```silk
import std::json;

struct User {
  name: string,
  active: bool,
  age: i64,
}

impl User {
  public fn append_json (self: &User, mut doc: &Document) -> i64? {
    let root_opt = doc.new_object();
    if root_opt == None {
      return None;
    }

    let root: i64 = root_opt ?? 0 as i64;
    if !doc.object_put_string(root, "name", self.name) {
      return None;
    }
    if !doc.object_put_bool(root, "active", self.active) {
      return None;
    }
    if !doc.object_put_number_i64(root, "age", self.age) {
      return None;
    }

    let tags_opt = doc.object_put_new_array(root, "tags");
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
- Writer-style JSON emission that does not require building an intermediate
 string.
- JSON Pointer or similar query helpers for nested lookup paths.
