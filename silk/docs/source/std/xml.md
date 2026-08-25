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

- `vendor/lib/<target-layout>/libxml2.a`
- `vendor/lib/<target-layout>/libsilk_xml_shims.a`

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
- `PARSE_NOERROR` / `PARSE_NOWARNING` (silence libxml2 default error handlers)

Callers can override the libxml2 option bits via `Document.parse_with_options`.
