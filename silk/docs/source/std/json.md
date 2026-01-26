# `std::json`

Status: **Implemented subset + design**. `std::json` provides a robust JSON parser and
stringifier suitable for Silk programs.

Primary goals:

- Correct, spec-driven parsing of RFC 8259 JSON (objects, arrays, strings,
  numbers, booleans, null).
- A memory model that works well with the current compiler subset:
  - parse produces an index-based DOM stored inside a `Document`,
  - arrays/objects use integer “next” links (no `&T` struct fields).
- High performance by default:
  - **borrowed parsing** avoids allocating for unescaped strings and numbers by
    slicing into the input string,
  - strings are only allocated when they contain escapes that must be decoded.
- Deterministic output:
  - compact `stringify` and configurable `stringify_pretty`.

## Data Model

The DOM is represented by an index table owned by a `Document`:

- A `Document` owns:
  - node tables (`tag`, payload fields, sibling links),
  - optional owned allocations for decoded strings and owned-number lexemes.
- JSON values are referred to by `ValueId` (an `i64` node index).

In the current compiler subset, struct fields do not support reference types
(`&T` / `&T?`) and `std::vector::Vector(T)` is scalar-slot-oriented (raw-cast
storage). `std::json` therefore stores its DOM as scalar tables and uses index
links for arrays/objects.

### Arrays and Objects

- Arrays store a `first_child` id and each element node stores a `next` id.
- Objects store a `first_member` id and each member node stores:
  - a key `string` view,
  - a value `ValueId`,
  - a `next` member id.

## Strings

- Parsed string values are exposed as decoded UTF-8 `string` views:
  - when the source contains **no escapes**, the string is borrowed from the
    input (zero-copy),
  - when the source contains escapes, the decoded bytes are stored in an owned
    allocation tracked by the `Document` and the view points to that allocation.
- Supported escapes:
  - `\\`, `\"`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`
  - `\uXXXX` (including surrogate pairs).

## Numbers

`std::json` preserves the number lexeme (as a `string` view) and also provides
helpers to interpret it as `i64` and/or `f64` when needed.

## Parsing

Two parse modes are provided as `Document` methods:

- **Borrowed**: `doc.parse(s)` borrows unescaped strings and number lexemes from
  `s`. The caller must ensure `s` outlives any `string` views read from `doc`.
- **Owned**: `doc.parse_owned(s)` copies all strings and number lexemes into
  allocations tracked by `doc` (independent of `s`).

Both methods:

- clear the `Document` first,
- return `ParseResult` (`Ok(root)` on success, `Err(ParseError)` on error),
- and record the result on the `Document`:
  - `doc.is_ok()` reports success,
  - `doc.root_value()` returns the root `ValueId` on success,
  - `doc.err` contains the parse error details (`kind`, byte `offset`, and 1-based `line`/`column`).

Allocation failures are also reported as ordinary parse errors:

- on out-of-memory, parse returns `Err(ParseError{ kind: ERR_OUT_OF_MEMORY, ... })` and sets
  `doc.err.kind` to `ERR_OUT_OF_MEMORY`.

In the current backend subset, `Document` is typically used as a
heap reference:

```silk
import std::json;

let mut doc: &Document = new Document();
let root_r: std::json::ParseResult = (mut doc).parse(`{"a":1}`);
```

## Stringifying

- `stringify(doc, value)` returns `Result(String, OutOfMemory)` containing compact JSON.
- `stringify_pretty(doc, value, indent)` returns `Result(String, OutOfMemory)` containing
  pretty-printed JSON with a fixed number of spaces per indent level.

Planned follow-ups (tracked in `PLAN.md`):

- streaming tokenization (SAX-style) for very large inputs,
- a writer interface that can stream output without building a whole string,
- JSON Pointer helpers (RFC 6901) for querying nested values.
