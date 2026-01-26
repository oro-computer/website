# `std::toml`

Status: **Initial implementation + design**. `std::toml` provides a TOML v1.0 parser that
builds an index-based DOM suitable for the current compiler/backend subset.

Primary goals:

- Correct, spec-driven parsing of TOML v1.0 documents:
  - key/value pairs,
  - dotted keys,
  - tables (`[table]`) and array-of-tables (`[[table]]`),
  - strings, integers, floats, booleans, datetimes, arrays, inline tables.
- A memory model that works well with the current subset:
  - parse produces an index-based DOM stored inside a `Document`,
  - arrays/tables are represented via integer “next” links (no `&T` struct
    fields).
- High performance by default:
  - **borrowed parsing** avoids allocating for simple strings/numbers by slicing
    into the input string,
  - allocations are only performed for escaped strings and for owned parsing.

## Data Model

The DOM is represented by an index table owned by a `Document`:

- A `Document` owns:
  - node tables (`tag`, payload fields, sibling links),
  - optional owned allocations for decoded strings and owned lexemes.
- TOML values are referred to by `ValueId` (an `i64` node index).

Tables store a linked list of `member` nodes (key/value pairs). Arrays store a
linked list of element nodes.

## Strings

- Basic strings (`"..."`) support TOML escapes including Unicode `\\uXXXX` /
  `\\UXXXXXXXX`.
- Literal strings (`'...'`) do not interpret escapes.
- Multiline basic/literal strings (`\"\"\"...\"\"\"` and `'''...'''`) are parsed,
  including TOML’s line-ending normalization rules.

Parsed string values are exposed as UTF-8 `string` views:

- when the source contains no escapes and borrowed parsing is used, the string
  view points into the input (zero-copy),
- otherwise, decoded bytes are stored in an owned allocation tracked by the
  `Document`.

## Numbers

`std::toml` preserves numeric lexemes as `string` views and provides helpers to
interpret them as `i64` and/or `f64` when needed:

- integers support `_` separators and `0x`/`0o`/`0b` bases,
- floats support `_` separators, fractional/exponent forms, and special values.

## Datetimes

TOML datetime values are preserved as lexeme `string` views. A future version
of `std::toml` will integrate with `std::temporal` once the necessary
infrastructure is stable.

## Parsing

Two parse modes are provided as `Document` methods:

- **Borrowed**: `doc.parse(s)` borrows unescaped strings and numeric/datetime
  lexemes from `s`. The caller must ensure `s` outlives any `string` views read
  from `doc`.
- **Owned**: `doc.parse_owned(s)` copies all strings and lexemes into allocations
  tracked by `doc` (independent of `s`).

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

In the current executable backend subset, `Document` is typically
used as a heap reference:

```silk
import std::toml;

let mut doc: &Document = new Document();
let root_r: std::toml::ParseResult = (mut doc).parse(`a = 1`);
```

## Planned Follow-ups

- Streaming tokenization (SAX-style) for very large inputs.
- Canonical TOML emission/serialization once the DOM/query surface stabilizes.
- Rich datetime parsing and integration with `std::temporal`.
