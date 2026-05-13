# `std::url`

`std::url` provides a WHATWG URL parser/serializer and `URLSearchParams`-style
behavior.

Canonical doc: [url](?p=std/url).

## Notes

- Implemented (core parsing + serialization + `URLSearchParams`).
- Details: [url](?p=std/url)

## Importing

```silk
import url from "std/url";
import { URL, URLResult, URLSearchParams } from "std/url";
import memory from "std/memory";
import strings from "std/strings";
```

## Exported API

- `url::parse(input: string) -> URLResult`
- `url::parse_with_base(input: string, base: &URL) -> URLResult`
- `URL.href() -> Result(strings::String, memory::OutOfMemory)`
- `URL.origin() -> Result(strings::String, memory::OutOfMemory)`
- `URLSearchParams.from_string(s: string) -> Result(URLSearchParams, memory::OutOfMemory)`
- `URLSearchParams.to_string() -> Result(strings::String, memory::OutOfMemory)`
- `URLSearchParams.has(name: string) -> Result(bool, memory::OutOfMemory)`
- `URLSearchParams.get(name: string) -> Result(strings::String?, memory::OutOfMemory)`
- `URLSearchParams.append/delete/set/sort -> memory::OutOfMemory?`

## Examples

### Example: parse + resolve + query params
```silk
import url from "std/url";
import { URL, URLResult, URLSearchParams } from "std/url";
import strings from "std/strings";

fn dummy_url () -> URL {
  return URL{
    scheme: strings::String.empty(),
    username: strings::String.empty(),
    password: strings::String.empty(),
    host_kind: 0,
    host_str: strings::String.empty(),
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
    path: strings::String.empty(),
    query: strings::String.empty(),
    has_query: false,
    fragment: strings::String.empty(),
    has_fragment: false,
    cannot_be_a_base: false,
  };
}

fn main () -> int {
  let abs: URLResult = url::parse("https://example.com:443/a/./b/../c?x=1#frag");
  if abs.value == None { return 1; }

  let mut url: URL = abs.value ?? dummy_url();
  let mut href_r = url.href();
  if href_r.err != None {
    url.drop();
    return 2;
  }
  href_r.err = None;
  let mut href: strings::String = href_r.value ?? strings::String.empty();
  href_r.value = None;
  if href.as_string() != "https://example.com/a/c?x=1#frag" {
    href.drop();
    url.drop();
    return 2;
  }
  href.drop();

  let base_res: URLResult = url::parse("https://example.com/dir/file");
  if base_res.value == None {
    url.drop();
    return 3;
  }
  let mut base: URL = base_res.value ?? dummy_url();
  let rel_res: URLResult = url::parse_with_base("../x?y=z", base);
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
  let mut href2: strings::String = href2_r.value ?? strings::String.empty();
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
  let mut qs: strings::String = qs_r.value ?? strings::String.empty();
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
  let mut v_opt: strings::String? = v_r.value ?? None;
  v_r.value = None;
  if v_opt == None {
    params.drop();
    url.drop();
    return 7;
  }

  let mut v: strings::String = v_opt ?? strings::String.empty();
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
  let mut qs2: strings::String = qs2_r.value ?? strings::String.empty();
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

- Canonical doc: [url](?p=std/url)
- End-to-end fixture: `tests/silk/pass_std_url_basic.slk`
