# `std::http`

Status: **Implemented (hosted, blocking; HTTP/1.1 subset)**. `std::http` provides
HTTP/1.1 request/response parsing and a small blocking client/server connection
API on top of `std::net::TcpStream`.

See also:

- `docs/std/networking.md` (`std::net`)
- `docs/std/https.md` (`std::https` layered on `std::tls`)
- RFC 7230 / RFC 7231 (HTTP/1.1 message syntax and semantics)

## Scope (Current)

Implemented:

- HTTP/1.1 request line and response status line parsing.
- Case-insensitive header scanning (`header(name)`).
- Body handling via `Content-Length` (read/write).
- Blocking I/O over `std::net::TcpStream`.

Not implemented (yet):

- Chunked transfer encoding (`Transfer-Encoding: chunked`).
- HTTP/2 or HTTP/3.
- Streaming bodies (incremental read/write APIs).
- Automatic decompression, redirects, cookies, proxies, etc.

## Public API (Current Compiler Subset)

```silk
module std::http;

import std::net;
import std::result;
import std::strings;

export let DEFAULT_MAX_HEADER_BYTES: i64 = 16384;

// Errors use a small set of integer kind codes.
export let ERR_IO: int = 1;
export let ERR_TOO_LARGE: int = 2;
export let ERR_BAD_MESSAGE: int = 3;
export let ERR_UNSUPPORTED_TRANSFER_ENCODING: int = 4;
export let ERR_BAD_CONTENT_LENGTH: int = 5;
export let ERR_OUT_OF_MEMORY: int = 6;

export error Error {
  kind: int,
}

// Parsed HTTP request backed by owned bytes.
struct Request { /* opaque */ }
export type RequestResult = std::result::Result(Request, Error);
impl Request {
  public fn parse (input: string) -> RequestResult;
  public fn method (self: &Request) -> string;
  public fn target (self: &Request) -> string;
  public fn version (self: &Request) -> string;
  public fn header (self: &Request, name: string) -> string?;
  public fn body (self: &Request) -> string;
}

// Parsed HTTP response backed by owned bytes.
struct Response { /* opaque */ }
export type ResponseResult = std::result::Result(Response, Error);
impl Response {
  public fn parse (input: string) -> ResponseResult;
  public fn version (self: &Response) -> string;
  public fn status_code (self: &Response) -> int;
  public fn reason (self: &Response) -> string;
  public fn header (self: &Response, name: string) -> string?;
  public fn body (self: &Response) -> string;
}

// A blocking connection wrapper that can read/write one message at a time.
struct Connection { /* opaque */ }
impl Connection {
  public fn from_stream (stream: std::net::TcpStream) -> Connection;
  public fn is_valid (self: &Connection) -> bool;
  public fn close (mut self: &Connection) -> Error?;

  // Client helpers.
  public fn write_request (self: &Connection, method: string, target: string, host: string, body: string) -> Error?;
  public fn read_response (mut self: &Connection) -> ResponseResult;

  // Server helpers.
  public fn read_request (mut self: &Connection) -> RequestResult;
  public fn write_response (self: &Connection, status: int, reason: string, body: string) -> Error?;
}
```

Notes:

- This API is currently blocking and uses `Connection: close` by default.
- Parsed messages own their backing bytes and return borrowed `string` views into
  those bytes; the returned views are valid until the message is dropped.

## Example (Client)

```silk
import std::http;
import std::net;

fn trap (T;) -> T {
  std::abort();
}

export fn main () -> int {
  // Plain HTTP to a loopback server (no DNS in the current stdlib).
  let addr = net::SocketAddrV4.loopback(8080);
  let stream_r = net::TcpStream.connect(addr);
  if stream_r.is_err() {
    return 1;
  }
  let stream: net::TcpStream = match (stream_r) {
    net::TcpStreamResult::Ok(v) => v,
    net::TcpStreamResult::Err(_) => trap(net::TcpStream;),
  };

  let mut conn = http::Connection.from_stream(stream);
  let w_err: http::Error? = conn.write_request("GET", "/", "localhost", "");
  if w_err != None {
    (mut conn).close();
    return 2;
  }

  let resp_r = (mut conn).read_response();
  if resp_r.is_err() {
    (mut conn).close();
    return 3;
  }
  let resp: http::Response = match (resp_r) {
    http::ResponseResult::Ok(v) => v,
    http::ResponseResult::Err(_) => trap(http::Response;),
  };
  _ = resp.status_code();
  (mut conn).close();
  return 0;
}
```

## Validation Rules

- `Content-Length` must parse as a non-negative decimal value.
- When `Transfer-Encoding` is present and not equal to `"identity"`, parsing
  fails with `ERR_UNSUPPORTED_TRANSFER_ENCODING`.
- Request/response header blocks are limited by `DEFAULT_MAX_HEADER_BYTES`
  (and per-connection configuration where applicable).
