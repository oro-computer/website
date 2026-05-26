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
export fn from_extension (extension: string) -> string?;
export fn extension (content_type: string) -> string?;
export fn type_for_path (path: string) -> string;
export fn content_type (path: string) -> string;
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
