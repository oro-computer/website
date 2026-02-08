# `std::url`

`std::url` provides a WHATWG URL parser/serializer and `URLSearchParams`-style
behavior.

Canonical doc: `docs/std/url.md`.

## Status

- Implemented (core parsing + serialization + `URLSearchParams`).
- Details: `docs/std/url.md`

## Importing

```silk
import std::url;
import std::strings;
```

## API (selected)

- `std::url::parse(input: string) -> URLResult`
- `std::url::parse_with_base(input: string, base: &URL) -> URLResult`
- `URL.href() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`
- `URL.origin() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`
- `URLSearchParams.from_string(s: string) -> std::result::Result(URLSearchParams, std::memory::OutOfMemory)`
- `URLSearchParams.to_string() -> std::result::Result(std::strings::String, std::memory::OutOfMemory)`
- `URLSearchParams.has(name: string) -> std::result::Result(bool, std::memory::OutOfMemory)`
- `URLSearchParams.get(name: string) -> std::result::Result(std::strings::String?, std::memory::OutOfMemory)`
- `URLSearchParams.append/delete/set/sort -> std::memory::OutOfMemory?`

## Examples

### Works today: parse + resolve + query params

```silk
import std::url;
import std::strings;

fn dummy_url () -> URL {
  return URL{
    scheme: std::strings::String.empty(),
    username: std::strings::String.empty(),
    password: std::strings::String.empty(),
    host_kind: 0,
    host_str: std::strings::String.empty(),
    ipv4: 0,
    ipv6_s0: 0,
    ipv6_s1: 0,
    ipv6_s2: 0,
    ipv6_s3: 0,
    ipv6_s4: 0,
    ipv6_s5: 0,
    ipv6_s6: 0,
    ipv6_s7: 0,
    port: None,
    path: std::strings::String.empty(),
    query: std::strings::String.empty(),
    has_query: false,
    fragment: std::strings::String.empty(),
    has_fragment: false,
    cannot_be_a_base: false,
  };
}

fn main () -> int {
  let abs: URLResult = std::url::parse("https://example.com:443/a/./b/../c?x=1#frag");
  if abs.value == None { return 1; }

  let mut url: URL = abs.value ?? dummy_url();
  let mut href_r = url.href();
  if href_r.err != None {
    url.drop();
    return 2;
  }
  href_r.err = None;
  let mut href: std::strings::String = href_r.value ?? std::strings::String.empty();
  href_r.value = None;
  if href.as_string() != "https://example.com/a/c?x=1#frag" {
    href.drop();
    url.drop();
    return 2;
  }
  href.drop();

  let base_res: URLResult = std::url::parse("https://example.com/dir/file");
  if base_res.value == None {
    url.drop();
    return 3;
  }
  let mut base: URL = base_res.value ?? dummy_url();
  let rel_res: URLResult = std::url::parse_with_base("../x?y=z", base);
  base.drop();
  if rel_res.value == None {
    url.drop();
    return 4;
  }

  let mut rel: URL = rel_res.value ?? dummy_url();
  let mut href2_r = rel.href();
  if href2_r.err != None {
    rel.drop();
    url.drop();
    return 5;
  }
  href2_r.err = None;
  let mut href2: std::strings::String = href2_r.value ?? std::strings::String.empty();
  href2_r.value = None;
  if href2.as_string() != "https://example.com/x?y=z" {
    href2.drop();
    rel.drop();
    url.drop();
    return 5;
  }
  href2.drop();
  rel.drop();

  let mut params_r = URLSearchParams.from_string("?a=b%20c&d=e");
  if params_r.err != None {
    url.drop();
    return 6;
  }
  params_r.err = None;
  let mut params: URLSearchParams = params_r.value ?? URLSearchParams.empty();
  params_r.value = None;

  let mut qs_r = params.to_string();
  if qs_r.err != None {
    params.drop();
    url.drop();
    return 6;
  }
  qs_r.err = None;
  let mut qs: std::strings::String = qs_r.value ?? std::strings::String.empty();
  qs_r.value = None;
  if qs.as_string() != "a=b+c&d=e" {
    qs.drop();
    params.drop();
    url.drop();
    return 6;
  }
  qs.drop();

  let mut v_r = params.get("a");
  if v_r.err != None {
    params.drop();
    url.drop();
    return 7;
  }
  v_r.err = None;
  let mut v_opt: std::strings::String? = v_r.value ?? None;
  v_r.value = None;
  if v_opt == None {
    params.drop();
    url.drop();
    return 7;
  }

  let mut v: std::strings::String = v_opt ?? std::strings::String.empty();
  v_opt = None;
  if v.as_string() != "b c" {
    v.drop();
    params.drop();
    url.drop();
    return 8;
  }
  v.drop();

  if params.delete("d") != None {
    params.drop();
    url.drop();
    return 9;
  }

  let mut qs2_r = params.to_string();
  if qs2_r.err != None {
    params.drop();
    url.drop();
    return 9;
  }
  qs2_r.err = None;
  let mut qs2: std::strings::String = qs2_r.value ?? std::strings::String.empty();
  qs2_r.value = None;
  if qs2.as_string() != "a=b+c" {
    qs2.drop();
    params.drop();
    url.drop();
    return 9;
  }
  qs2.drop();

  params.drop();
  url.drop();
  return 0;
}
```

## See also

- Canonical doc: `docs/std/url.md`
- End-to-end fixture: `tests/silk/pass_std_url_basic.slk`
