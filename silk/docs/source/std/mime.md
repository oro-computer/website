# `std::mime`

`std::mime` maps file names, extensions, and content-type strings to MIME
metadata suitable for HTTP responses, file indexing tools, and package
publication helpers. Its shape is influenced by the local runtime MIME API:
lookup by name or content type, a parsed `MIMEType` view, and separate helpers
for content-type parameters.

The module is intentionally allocation-free in Silk currently:
returned strings are borrowed views or static constants.

## Exported API
```silk
module std::mime;

export let APPLICATION_OCTET_STREAM: string;
export let TEXT_PLAIN_UTF8: string;
export let TEXT_HTML_UTF8: string;

export struct Lookup {
  name: string,
  mime: string,
}

export struct Mapping {
  name: string,
  mime: string,
}

export struct MIMEType { ... }

impl MIMEType {
  public fn parse (input: string) -> MIMEType;
  public fn is_valid (self: &MIMEType) -> bool;
  public fn top_level (self: &MIMEType) -> string;
  public fn subtype (self: &MIMEType) -> string;
  public fn essence (self: &MIMEType) -> string;
  public fn is_textual (self: &MIMEType) -> bool;
}

export fn lookup (query: string) -> Lookup?;
export fn lookup_with (query: string, mappings: Mapping[]) -> Lookup?;
export fn from_extension (extension: string) -> string?;
export fn from_extension_with (extension: string, mappings: Mapping[]) -> string?;
export fn extension (content_type: string) -> string?;
export fn extension_with (content_type: string, mappings: Mapping[]) -> string?;
export fn type_for_path (path: string) -> string;
export fn type_for_path_with (path: string, mappings: Mapping[]) -> string;
export fn content_type (path: string) -> string;
export fn content_type_with (path: string, mappings: Mapping[]) -> string;
export fn essence (content_type: string) -> string;
export fn parameter (content_type: string, name: string) -> string?;
export fn is_textual (content_type: string) -> bool;
export fn with_utf8_charset (mime: string) -> string;
```

## Lookup Rules

- `from_extension("html")` and `from_extension(".html")` both return
 `"text/html"`.
- `type_for_path("site/index.html")` returns the base MIME type
 `"text/html"`.
- `content_type("site/index.html")` returns an HTTP-ready value with a UTF-8
 charset when the type is textual, for example
 `"text/html; charset=utf-8"`.
- Special filenames are checked by exact basename before extension fallback.
 Examples include `.gitignore`, `.gitattributes`, `.gitmodules`,
 `.dockerignore`, `.editorconfig`, `.env`, `.npmrc`, `.yarnrc`, `README`,
 `LICENSE`, `COPYING`, `NOTICE`, `CHANGELOG`, `CONTRIBUTING`, and `VERSION`;
 these map to `text/plain`.
- `Dockerfile` and `Makefile` are special basenames with more specific textual
 subtypes: `text/x-dockerfile` and `text/x-makefile`.
- Silk sources are first-class textual files: `.slk` and `.silk` map to
 `text/x-silk`, and `content_type("main.slk")` returns
 `"text/x-silk; charset=utf-8"`.
- Unknown extensions map to `APPLICATION_OCTET_STREAM` through
 `type_for_path(...)` / `content_type(...)`; `from_extension(...)` returns
 `None` for the same unknown extension.
- `lookup(...)` accepts either an extension/name or a MIME content type. For
 example, `lookup("svg")` and `lookup("image/svg+xml")` both return a
 `Lookup` with `name = "svg"` and `mime = "image/svg+xml"`.
- The shipped database covers the common static-site and file-serving set:
 text, HTML, CSS, CSV, Markdown, JavaScript, JSON/NDJSON, XML, YAML, TOML,
 web manifests, WASM, PDFs, common archives, images, audio/video, and web
 fonts.

## Custom Mappings

Projects can layer their own mappings without modifying the shipped database by
passing `Mapping[]` to the `_with` helpers. Custom entries are checked before
the built-in database. `name` can be an exact basename such as `"Buildfile"` or
`".toolrc"`, or an extension with or without a leading dot:

```silk
let custom: std::mime::Mapping[] = [
  std::mime::Mapping{ name: "assetpack", mime: "application/x-asset-pack" },
  std::mime::Mapping{ name: "Buildfile", mime: "text/plain" },
];

let a = std::mime::content_type_with("public/site.assetpack", custom);
let b = std::mime::content_type_with("config/Buildfile", custom);
let ext = std::mime::extension_with("application/x-asset-pack", custom);
```

For path lookup, exact basename mappings are checked first, then extension-style
custom mappings, then the built-in special-file and extension database. Reverse
lookups use the same custom-first ordering through `lookup_with(...)` and
`extension_with(...)`.

## Parameters

`MIMEType.parse(...)` and `essence(...)` treat `;` as the start of parameters.
The current parameter helper returns borrowed string views:

```silk
let ct = "text/html; charset=utf-8";
let charset = std::mime::parameter(ct, "charset") ?? "utf-8";
```

Parameter names are matched case-insensitively and ASCII whitespace around
names and values is ignored.

## Intended Use

HTTP file servers should prefer:

```silk
let content_type = std::mime::content_type(path);
```

Lower-level tools that need a bare registered type should use
`type_for_path(...)` or `from_extension(...)`.

Useful guide queries:

```sh
silk guide mime content type
silk guide module:std::mime
silk guide std::mime::content_type_with
silk guide std::mime::Mapping
```
