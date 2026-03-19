# Web IDL (`std::idl::web`)

Status: **Implemented subset (initial implementation)**.

This module provides a Web IDL parser plus an ergonomic, query-oriented API for
inspecting the parsed document.

The long-term goal is to support bidirectional binding generation:

- **Web IDL → Silk**: generate Silk APIs for DOM / JavaScript environments (for
  example when targeting WASM and calling out to JavaScript host APIs).
- **Silk → JS bindings**: generate JavaScript glue for Silk-defined interfaces
  (when embedding Silk/WASM in JS runtimes).

This first slice focuses on a stable, testable parsing substrate that can be
grown as `silk bindgen` work lands.

## Design Goals

- **Lossless enough for bindgen**: preserve source spans for identifiers and
  raw values so downstream tools can generate bindings and diagnostics.
- **Ergonomic queries**: parse once, then ask the document for interfaces,
  members, argument lists, and types via IDs and ranges (no recursion required
  for common workflows).
- **Compact storage**: avoid heavyweight allocation patterns; store
  parsed data in compact slot vectors (`std::vector::Vector(i64)`).

## High-Level API

- `std::idl::web::parse(source: string) -> Result(Document, ParseError)`
- `std::idl::web::parse_owned(source: std::strings::String) -> Result(Document, ParseError)`
- `Document` owns the (copied or moved) source text and stores all parsed spans
  as offsets into that owned source.

## Parse Errors

`ParseError` reports:

- `code: int` (stable kind code), and `kind() -> ParseErrorKind` / `message() -> string`,
- `offset: i64` (byte offset), `line: i64` / `column: i64` (1-based),
- `requested: i64` (non-zero only for `OutOfMemory`).

The `Document` API exposes:

- definition iteration (`def_count`, `def_kind`, `def_name`, `def_members`, …)
- member inspection (`member_kind`, `member_name`, `member_type`, …)
- type inspection (`type_kind`, `type_name`, `type_children`, …)
- extended attributes (`extattr_name`, `extattr_value`, …)

All names and raw values are represented as `SpanId`s that can be rendered to
`string` views via `Document.span_text(span_id)`.

## Current Grammar Coverage (Initial)

Implemented as a **lenient** parser that can preserve and skip unknown
constructs:

- Extended attributes: `[Attr, Attr=Value, Attr(Args)]` (value captured as a raw span)
- Top-level definitions:
  - `interface`, `partial interface`, `interface mixin`
  - `dictionary`, `partial dictionary`
  - `enum`
  - `typedef`
  - `callback` (function form) and `callback interface`
  - `includes` statements (`A includes B;`)
  - unknown definitions are preserved as `DefKind::Unknown`
- Members (within interfaces/dictionaries/namespaces):
  - attributes, operations, constructors, constants
  - dictionary fields (`required` + default values captured as raw spans)
  - unknown members are preserved as `MemberKind::Unknown`
- Types:
  - identifier types (including common multi-token builtins like `unsigned long`)
  - generic types (`Foo<Bar, Baz>`)
  - union types (`(A or B or C)?`)
  - nullable types via `?`

The grammar coverage will expand as the bindgen pipeline becomes concrete.

## Notes For Bindgen

The parser intentionally preserves:

- definition/member/argument extended attributes,
- raw spans for constant/default values,
- enough structural information (member kinds, argument lists, type AST) to map
  Web platform APIs to a generated Silk surface and to synthesize JS host glue.
