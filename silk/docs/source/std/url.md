# `std::url`

`std::url` provides a WHATWG-URL-compatible URL parser and serializer plus `URLSearchParams` behavior (`application/x-www-form-urlencoded`).

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

`URL` also implements `std::interfaces::Parse(ParseError)`, so the
receiverless convenience method `URL.parse(input: string) -> URLResult`
forwards to `std::url::parse` through the standard static protocol surface.

### URL record

`URL` is an owned URL record with accessor methods:

- `URL` owns heap allocations and implements `std::interfaces::Drop`; it is
 released automatically at scope exit and may also be dropped explicitly via
 `url.drop()`.
- Destruction transfers each owned `String` field into a temporary, installs
 the empty-string sentinel, and drops the temporary. This follows Silk's
 ownership-field take contract and keeps explicit and automatic repeated
 cleanup safe without manually freeing storage behind a still-live field.
- `URL` also implements `std::interfaces::TrySerialize(std::memory::OutOfMemory)`;
 `url.try_serialize()` returns the same canonical serialization as `url.href()`.
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

- `URLSearchParams` owns its query buffer and implements `std::interfaces::Drop`,
 `std::interfaces::Len`, `std::interfaces::IsEmpty`,
 `std::interfaces::Serialize(string)`, and
 `std::interfaces::TrySerialize(std::memory::OutOfMemory)`.
- Its destructor uses the same take/reinitialize/drop sequence for the owned
 query buffer.
- `append`, `delete`, `set`, and `sort` construct the replacement before
 changing the owner. Allocation failure leaves the original query unchanged;
 success takes the old buffer, installs the replacement, and releases the old
 allocation exactly once. Repeated mutation therefore uses storage
 proportional to the current query rather than the mutation count.
- `URLSearchParams.empty() -> URLSearchParams`
- `URLSearchParams.from_string(s: string) -> std::result::Result(URLSearchParams, std::memory::OutOfMemory)`
 - Accepts either `"a=b&c=d"` or `"?a=b&c=d"`.
- `URLSearchParams.parse(s: string) -> std::result::Result(URLSearchParams, std::memory::OutOfMemory)`
 - Standardized receiverless parse surface; forwards to `from_string`.
- `as_string() -> string` — borrowed encoded query string (no leading `?`)
- `to_string() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)` — the encoded query string (no leading `?`).
- `try_serialize() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)` — the standardized fallible owned-string rendering surface; forwards to `to_string()`.
- `len() -> i64` — number of fields.
- `is_empty() -> bool` — `true` when `len() == 0`.
- `has(name: string) -> std::result::Result(bool, std::memory::OutOfMemory)`
- `get(name: string) -> std::result::Result(std::strings::String?, std::memory::OutOfMemory)` — decoded value (`Ok(Some(value))`), `Ok(None)` when absent, or `Err(OutOfMemory)`.
- `append(name: string, value: string) -> std::memory::OutOfMemory?`
- `delete(name: string) -> std::memory::OutOfMemory?`
- `set(name: string, value: string) -> std::memory::OutOfMemory?`
- `sort() -> std::memory::OutOfMemory?` — stable sort by decoded name, then re-serialize.

## Notes

- This module does not implement the JavaScript `URL` object API (setters, live `searchParams` binding, etc.); it provides a low-level URL record plus helpers that follow the WHATWG parsing and serialization rules.
- Domain processing uses a UTF-8 + punycode-based `domain_to_ascii` implementation and supports common Unicode dot separators; full UTS46 mapping and normalization requires additional Unicode data.
- `URLSearchParams` uses the same zero-capacity-empty / trailing-NUL storage
 invariant as `std::strings::String`, so `let q: string = params as string;`
 is allocation-free while `to_string()` remains the owned-copy API.
- The conversion convention is therefore:
 - `params as string` or `params.serialize()` for borrowed query text,
 - `params.try_serialize()` for an owned query-string copy,
 - and `url.try_serialize()` / `url.href()` for canonical full-URL output.

Example:

```silk
import std::url;

fn main () -> int {
  let params_r = std::url::URLSearchParams.from_string("?a=b%20c&d=e");
  let mut params = match (params_r) {
    Ok(v) => v,
    Err(_) => std::url::URLSearchParams.empty(),
  };

  let q: string = params as string;
  if q != "a=b+c&d=e" {
    params.drop();
    return 1;
  }

  match (std::url::URL.parse("https://example.com?a=b+c&d=e")) {
    Ok(mut u) => {
      u.drop();
    },
    Err(_) => {
      params.drop();
      return 2;
    },
  }

  params.drop();
  return 0;
}
```
