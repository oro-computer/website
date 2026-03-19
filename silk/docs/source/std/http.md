# `std::http`

Status: **Implemented (hosted, blocking; HTTP/1.1 subset)**. `std::http` provides
HTTP/1.1 request/response parsing and a small blocking client/server connection
API on top of `std::net::TCPStream`.

## Description

Implemented:

- HTTP/1.1 request line and response status line parsing.
- Case-insensitive header scanning (`header(name)`).
- Body handling via `Content-Length` and `Transfer-Encoding: chunked` (parse/read).
- Blocking I/O over `std::net::TCPStream`.

Not implemented (yet):

- HTTP/2 or HTTP/3.
- Streaming bodies (incremental read/write APIs).
- Automatic decompression, redirects, cookies, proxies, etc.

## Exported API

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
  public fn from_stream (stream: std::net::TCPStream) -> Connection;
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

### Errors

- `DEFAULT_MAX_HEADER_BYTES`
- `ERR_IO`
- `ERR_TOO_LARGE`
- `ERR_BAD_MESSAGE`
- `ERR_UNSUPPORTED_TRANSFER_ENCODING`
- `ERR_BAD_CONTENT_LENGTH`
- `ERR_OUT_OF_MEMORY`
- `Error`

### Message types

- `Request`
  - `Request.parse(input) -> RequestResult`
  - `method()`, `target()`, `version()`, `header(name)`, `body()`
- `Response`
  - `Response.parse(input) -> ResponseResult`
  - `version()`, `status_code()`, `reason()`, `header(name)`, `body()`

### Connection

- `Connection.from_stream(stream) -> Connection`
- `is_valid() -> bool`
- `close() -> Error?`
- client helpers: `write_request(...)`, `read_response()`
- server helpers: `read_request()`, `write_response(...)`

## Examples

### Blocking client request

```silk
import std::http;
import std::net;

export fn main () -> int {
  // Plain HTTP to a loopback server (no DNS in the current stdlib).
  let addr = net::SocketAddrV4.loopback(8080);
  match (net::TCPStream.connect(addr)) {
    net::TCPStreamResult::Ok(stream) => {
      let mut conn = http::Connection.from_stream(stream);
      let w_err: http::Error? = conn.write_request("GET", "/", "localhost", "");
      if w_err != None {
        conn.close();
        return 2;
      }

      match (conn.read_response()) {
        http::ResponseResult::Ok(resp) => {
          let _ = resp.status_code();
          conn.close();
          return 0;
        },
        http::ResponseResult::Err(_) => {
          conn.close();
          return 3;
        },
      }
    },
    net::TCPStreamResult::Err(_) => {
      return 1;
    },
  }
}
```

## Considerations

### Ownership and blocking behavior

- This API is currently blocking and uses `Connection: close` by default.
- Parsed messages own their backing bytes and return borrowed `string` views into
  those bytes; the returned views are valid until the message is dropped.

### Protocol and validation rules

- `Content-Length` must parse as a non-negative decimal value.
- When `Transfer-Encoding` is present, only `"identity"` and `"chunked"` are
  accepted; other encodings fail with `ERR_UNSUPPORTED_TRANSFER_ENCODING`.
- Request/response header blocks are limited by `DEFAULT_MAX_HEADER_BYTES`
  (and per-connection configuration where applicable).

## See also

- [`std::net`](?p=std/networking)
- [`std::https`](?p=std/https)
- RFC 7230 / RFC 7231
