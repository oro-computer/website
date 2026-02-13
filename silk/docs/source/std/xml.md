# `std::xml` — XML Parsing (libxml2)

Status: **design + initial implementation**. `std::xml` provides a small,
DOM-style XML parsing and traversal API backed by libxml2.

## Vendored Dependencies + Linking

On the hosted `linux/x86_64` baseline, `std::xml` relies on a vendored libxml2
build produced by the Silk compiler repository’s vendored dependency workflow.

- libxml2 tag `v2.15.1`

Run:

```sh
zig build deps
```

When the vendored archives are present, `silk build` auto-links:

- `vendor/lib/x64-linux/libxml2.a`
- `vendor/lib/x64-linux/libsilk_xml_shims.a`

In staged/installed toolchains, these archives are expected under the compiler
prefix:

- `build/lib/silk/vendor/lib/x64-linux/` (repo build prefix)
- `<prefix>/lib/silk/vendor/lib/x64-linux/` (installed)

when `std::xml` is present in the module set, and also when linking `.o`/`.a`
inputs that reference the shim symbols.

Note: libxml2 requires libm at link/runtime (typically `libm.so.6`).

## API Summary (Current)

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
- `PARSE_NOERROR` / `PARSE_NOWARNING` (silence libxml2 default error handlers)

Callers can override the libxml2 option bits via `Document.parse_with_options`.
