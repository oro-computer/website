# `std::url`

Status: **Implemented subset**. `std::url` provides a WHATWG-URL-compatible URL parser and serializer plus `URLSearchParams` behavior (`application/x-www-form-urlencoded`).

This module focuses on:

- WHATWG URL parsing (absolute and relative-with-base).
- Canonical URL serialization (`href`) and origin serialization (`origin`).
- Host parsing (domain / IPv4 / IPv6 / opaque) and percent-encoding sets.
- URLSearchParams-style query parsing and mutation.

## Exported API

### Parsing

- `parse(input: string) -> URLResult`
  - Parses an absolute URL (requires a scheme).
- `parse_with_base(input: string, base: &URL) -> URLResult`
  - Parses `input` as a URL relative to `base` using WHATWG relative resolution rules.

`URLResult` is `std::result::Result(URL, ParseError)`:

- `Ok(URL)` on success.
- `Err(ParseError)` on error.

Since `URL` owns heap allocations and implements `std::interfaces::Drop`, prefer
`match (r)` to extract values rather than `URLResult.ok_value(r)` /
`URLResult.err_value(r)`.

`ParseError.offset` is a byte offset into the sanitized input:

- leading/trailing ASCII whitespace is trimmed,
- ASCII tab/newline bytes are stripped (`\\t`, `\\n`, `\\r`).

`ParseError.kind` is one of the exported `ERR_*` constants. Use `error_message(kind)` to format a human-readable message.

Note: there is also a convenience method `URL.parse(input: string) -> URLResult`
which forwards to `std::url::parse`.

### URL record

`URL` is an owned URL record with accessor methods:

- `URL` owns heap allocations and implements `std::interfaces::Drop`; it is
  released automatically at scope exit and may also be dropped explicitly via
  `(mut url).drop()`.
- `href() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)` — canonical serialization of the full URL.
- `origin() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)` — serialized origin (opaque origins serialize as `"null"`).
- `scheme() -> string`
- `username() -> string`
- `password() -> string`
- `host() -> string?` — hostname (no port); `None` for null hosts.
- `port() -> int?`
- `path() -> string`
- `query() -> string?` — query without `?`.
- `fragment() -> string?` — fragment without `#`.

### URLSearchParams

`URLSearchParams` stores a URL-encoded query string and exposes common operations:

- `URLSearchParams` owns its query buffer and implements `std::interfaces::Drop`.
- `URLSearchParams.empty() -> URLSearchParams`
- `URLSearchParams.from_string(s: string) -> std::result::Result(URLSearchParams, std::memory::OutOfMemory)`
  - Accepts either `"a=b&c=d"` or `"?a=b&c=d"`.
- `to_string() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)` — the encoded query string (no leading `?`).
- `len() -> i64` — number of fields.
- `has(name: string) -> std::result::Result(bool, std::memory::OutOfMemory)`
- `get(name: string) -> std::result::Result(std::strings::String?, std::memory::OutOfMemory)` — decoded value (`Ok(Some(value))`), `Ok(None)` when absent, or `Err(OutOfMemory)`.
- `append(name: string, value: string) -> std::memory::OutOfMemory?`
- `delete(name: string) -> std::memory::OutOfMemory?`
- `set(name: string, value: string) -> std::memory::OutOfMemory?`
- `sort() -> std::memory::OutOfMemory?` — stable sort by decoded name, then re-serialize.

## Examples

### Parse, resolve, and mutate query params

```silk
import std::url;

fn main () -> int {
  let base = match std::url::parse("https://example.com/docs/index.html") {
    Ok(v) => v,
    Err(_) => return 1,
  };

  let rel = match std::url::parse_with_base("../guides/intro?lang=silk", base) {
    Ok(v) => v,
    Err(_) => return 2,
  };

  let href = match rel.href() {
    Ok(v) => v,
    Err(_) => return 3,
  };
  if href.as_string() != "https://example.com/guides/intro?lang=silk" {
    return 4;
  }

  let mut params = match URLSearchParams.from_string("?lang=silk&tab=overview") {
    Ok(v) => v,
    Err(_) => return 5,
  };

  if params.set("tab", "reference") != None {
    return 6;
  }

  let qs = match params.to_string() {
    Ok(v) => v,
    Err(_) => return 7,
  };
  if qs.as_string() != "lang=silk&tab=reference" {
    return 8;
  }

  return 0;
}
```

## Considerations

- This module does not implement the JavaScript `URL` object API (setters, live `searchParams` binding, etc.); it provides a low-level URL record plus helpers that follow the WHATWG parsing and serialization rules.
- Domain processing uses a UTF-8 + punycode-based `domain_to_ascii` implementation and supports common Unicode dot separators; full UTS46 mapping and normalization requires additional Unicode data.

## See also

- [`std::strings`](?p=std/strings)
- [`std::http`](?p=std/http)
- [`std::https`](?p=std/https)
