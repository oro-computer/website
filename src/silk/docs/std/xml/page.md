---
layout: "docs"
description: "std::xml provides a small, DOM-style XML parsing and traversal API backed by libxml2."
docsCollection: "silk"
section: "std"
order: 99
sourcePath: "std/xml.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `std::xml` — XML Parsing (libxml2)

`std::xml` provides a small,
DOM-style XML parsing and traversal API backed by libxml2.

## Built-In Dependencies + Linking

On supported hosted Linux x86_64 target layouts, `std::xml` relies on a
built-in libxml2 build produced by the Silk compiler repository’s vendored dependency workflow.

- libxml2 tag `v2.15.1`

Run:

```sh
zig build deps
```

For musl outputs, build the matching dependency layout first:

```sh
zig build deps -Dtarget=x86_64-linux-musl
```

When the built-in archives are present, `silk build` auto-links:

- `build/deps/libxml2-2.15.1-silk.2/<target-layout>/lib/libxml2.a`
- `build/deps/libxml2-2.15.1-silk.2/<target-layout>/lib/libsilk_xml_shims.a`

In staged/installed toolchains, these archives are expected under the compiler
prefix:

- `build/lib/silk/vendor/lib/<target-layout>/` (repo build prefix)
- `<prefix>/lib/silk/vendor/lib/<target-layout>/` (installed)

when `std::xml` is present in the module set, and also when linking `.o`/`.a`
inputs that reference the shim symbols.

Note: the built-in libxml2 path currently auto-links on `linux/x86_64` glibc
and musl and requires the target libc math provider at link/runtime
(`libm.so.6` on glibc, `libc.so` on musl).

## API Summary
- `Document.parse(xml: string) -> Result(Document, XmlFailed)`
- `Document.parse_with_options(xml: string, options: int) -> Result(Document, XmlFailed)`
- `Document.root() -> Node?`
- `Node.name() -> string` (borrowed view; valid while the `Document` is alive)
- `Node.first_child_element() -> Node?`
- `Node.next_element_sibling() -> Node?`
- `Node.content() -> Result(std::strings::String, XmlFailed)` (owned copy)
- `Node.attr(name: string) -> Result(std::strings::String?, XmlFailed)` (owned copy)
- `cleanup()` — optional libxml2 global cleanup

## Parse Safety Defaults

`Document.parse` uses safe defaults:

- `PARSE_NONET` (disable network access)
- `PARSE_NO_XXE` (disable loading external DTDs/entities)
- `PARSE_NO_SYS_CATALOG` (disable system catalog resolution)
- `PARSE_NOERROR` / `PARSE_NOWARNING` (silence libxml2 default error handlers)

Callers can override the libxml2 option bits via `Document.parse_with_options`.

Document parsing uses a dedicated libxml2 parser context and rejects documents
that are not well formed or namespace well formed, including reserved-prefix
misbindings. Parser status is checked before publishing the document handle;
failed documents and parser contexts are released on every path.

## In-memory XML Schema validation

`Schema.parse(xsd: string) -> Result(Schema, XmlFailed)` compiles a standalone
XSD document. It rejects malformed XML, schema diagnostics, and every external
resource request (including includes and imports); it never falls back to files
or network access. Multi-document schema inventories use `Schema.parse_bundle`
below. Silk dependency revision `2.15.1+silk.2` repairs nested resource callback
propagation (Lola SG-32). The standalone API retains its deny-all resource
policy independently of that correction.

`Schema.invalid()` returns an inert handle; `Schema.is_valid()` tests it.
`Schema.validate(document: &Document) -> Result(bool, XmlFailed)` returns true
for a conforming document and false for a schema mismatch. Invalid handles and
internal validation failures return errors. `ERR_VALIDATION_FAILED` is error
code 4. Validation allocates a fresh native context per call and does not read
instance-supplied schema locations. `Schema.drop()` releases the compiled schema
and clears its public opaque `handle: u64`; repeated drops are safe. The schema
owns its native representation independently of the input text and parsed DOM.
The `SchemaResult` alias names `Result(Schema, XmlFailed)`.

The native loader limitation is visible in the pinned
[libxml2 schema parser](https://github.com/GNOME/libxml2/blob/b7fa62cbe8ef0df5869e000d5b690bdedd07f33e/xmlschemas.c):
`xmlSchemaParseNewDoc` originally copied diagnostic handlers but not its
resource loader. The versioned dependency rebuild now propagates both the
loader and its caller context; see [built-in dependencies](/silk/docs/compiler/builtin-deps/).

## Bounded schema inventories

`SchemaSource { name: string, contents: string }` borrows one XSD document.
`Schema.parse_bundle(entry: string, sources: std::arrays::Slice(SchemaSource),
limits: SchemaLimits = SchemaLimits{}) -> SchemaResult` compiles an exact
in-memory inventory. The strings and slice need only live until the call returns;
the resulting schema owns its compiled native data.

Names are unique, case-sensitive relative paths using ASCII letters, digits,
`_`, `-`, `.`, and `/`; empty components and `.`/`..` components are forbidden.
No absolute paths, URI schemes, percent escapes, queries, fragments or backslashes
are accepted. Includes/imports resolve relative to each document's name and must
match an inventory member exactly. Missing resources and external DTD/entity
loads fail; no filesystem, network, catalog, or global-loader fallback is used.
The parser-local resolver propagates to nested schemas through the corrected
bundled libxml2 dependency. No process-global native loader or error hook is
replaced. Inventory order does not affect resolution; duplicate names fail.

`SchemaLimits` has `max_documents` (default 64, ceiling 1024), `max_bytes`
(default 8388608, ceiling 67108864), and `max_loads` (default 128, ceiling 4096).
All must be positive. Byte limits cover both total inventory input and cumulative
bytes supplied to native parsers; root input counts toward bytes and loads.
Names are at most 1024 bytes. Exhausted budgets return `ERR_RESOURCE_LIMIT` (5),
and denied resources return `ERR_RESOURCE_DENIED` (6). Malformed schemas remain
`ERR_PARSE_FAILED`; invalid inventory structure is `ERR_INVALID_INPUT`. These
budgets bound supplied resources, not native CPU time; use process limits when
compiling untrusted schemas. `Schema.parse` still rejects every external load.

Document parsing, schema compilation and validation reset the native last-error slot on return, including failure and invalid input. They do
not call global `cleanup()` or replace existing native error/resource hooks.
Callers should use the returned Silk errors, rather than retaining native error
pointers across these operations. Live DOMs and compiled schemas remain valid.
The bundled libxml2 build disables native thread support; serialize its use when
sharing a process with other native XML callers.

`PARSE_NO_SYS_CATALOG` (`1 << 25`) is included in default document options.
Explicit `parse_with_options` callers may choose a different catalog policy.
Schema bundle loaders bypass system catalogs at every nested depth through
libxml2 dependency revision `2.15.1+silk.2`.

For example, compile a root schema and its included type from borrowed strings:

```silk
import { Schema, SchemaSource, Document } from "std/xml";
import { Vector } from "std/vector";

fn main () -> int {
  let mut sources = Vector(SchemaSource).empty();
  sources.push(SchemaSource {
    name: "root.xsd",
    contents: `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"><xs:include schemaLocation="type.xsd"/><xs:element name="root" type="Value"/></xs:schema>`
  });
  sources.push(SchemaSource {
    name: "type.xsd",
    contents: `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"><xs:simpleType name="Value"><xs:restriction base="xs:int"/></xs:simpleType></xs:schema>`
  });
  let mut schema = Schema.parse_bundle("root.xsd", sources.as_slice()).unwrap_or(Schema.invalid());
  sources.drop();
  if !schema.is_valid() { return 1; }
  let mut document = Document.parse("<root>42</root>").unwrap_or(Document.invalid());
  let valid = schema.validate(document).unwrap_or(false);
  document.drop();
  schema.drop();
  return if valid { 0 } else { 2 };
}
```
