# `std::http`

`std::http` provides
HTTP/1.1 request/response parsing, a small blocking client/server connection
API on top of `std::net::TCPStream`, and ergonomic URL/stream client helpers.

See also:

- [networking](?p=std/networking) (`std::net`)
- [https](?p=std/https) (`std::https` layered on `std::tls`)
- [stream](?p=std/stream) (`std::stream` byte streams)
- [url](?p=std/url) (`std::url` parsing and serialization)
- RFC 7230 / RFC 7231 (HTTP/1.1 message syntax and semantics)

## Scope
Implemented:

- HTTP/1.1 request line and response status line parsing.
- Case-insensitive header scanning (`header(name)`).
- Body handling via `Content-Length` and `Transfer-Encoding: chunked` (parse/read).
- Blocking I/O over `std::net::TCPStream`.
- One-shot client helpers:
 - blocking: `request(...)`, `request_v6(...)`
 - async-friendly: `request_async(...)`, `request_v6_async(...)`
- URL-based client helpers:
 - blocking: `request_url(...)`
 - async-friendly: `request_url_async(...)`
- Header maps:
 - `HeadersMap` as a compact string key/value request-header carrier
 - constructors from newline-delimited text, an existing string map, or a
 string set of `key: value` pairs
- Stream convenience helpers:
 - blocking:
 `request_url_from_stream(...)`, `request_url_to_stream(...)`,
 `request_url_stream(...)`
 - async-friendly:
 `request_url_from_stream_async(...)`, `request_url_to_stream_async(...)`,
 `request_url_stream_async(...)`

Not implemented (yet):

- HTTP/2 or HTTP/3.
- Fully incremental streaming bodies. The stream helpers bridge
 `std::stream` to the current owned-message implementation: request streams
 are collected before sending, and response bodies are written to output
 streams after the response has been parsed.
- Automatic decompression, redirects, cookies, proxies, etc.
- Fully nonblocking connect/write/read integration. The async-friendly helpers
 currently offload the blocking one-shot request path to a task worker.

## Exported API

```silk
module std::http;

import net from "std/net";
import strings from "std/strings";
import map from "std/map";
import set from "std/set";

export let DEFAULT_MAX_HEADER_BYTES: i64 = 16384;

// Errors use a small set of integer kind codes.
export let ERR_IO: int = 1;
export let ERR_TOO_LARGE: int = 2;
export let ERR_BAD_MESSAGE: int = 3;
export let ERR_UNSUPPORTED_TRANSFER_ENCODING: int = 4;
export let ERR_BAD_CONTENT_LENGTH: int = 5;
export let ERR_OUT_OF_MEMORY: int = 6;
export let ERR_BAD_URL: int = 7;
export let ERR_STREAM: int = 8;

export error Error {
  kind: int,
}

export type HeaderMap = std::map::HashMap(string, string);
export type HeaderSet = std::set::SetMap(string);
export type HeadersMapResult = Result(HeadersMap, Error);

// Request header carrier. Keys and values are borrowed string views.
export struct HeadersMap { /* opaque */ }
export struct HeadersMapIter { /* opaque */ }
impl HeadersMap {
  public fn empty () -> HeadersMap;
  public fn from (lines: string) -> HeadersMapResult;
  public fn from_map (source: &HeaderMap) -> HeadersMapResult;
  public fn from_set (source: &HeaderSet) -> HeadersMapResult;
  public fn put (mut self: &HeadersMap, key: string, value: string) -> Error?;
  public fn get (self: &HeadersMap, key: string) -> string?;
  public fn iter (self: &HeadersMap) -> HeadersMapIter;
  public fn len (self: &HeadersMap) -> i64;
  public fn is_empty (self: &HeadersMap) -> bool;
  public fn drop (mut self: &HeadersMap) -> void;
}

// Parsed HTTP request backed by owned bytes.
struct Request { /* opaque */ }
export type RequestResult = Result(Request, Error);
impl Request {
  public fn parse (input: string) -> RequestResult;
  public fn method (self: &Request) -> string;
  public fn target (self: &Request) -> string;
  public fn version (self: &Request) -> string;
  public fn header (self: &Request, name: string) -> string?;
  public fn body (self: &Request) -> string;
  public fn write_body_to (self: &Request, dst: std::stream::WritableStream) -> Error?;
}

// Parsed HTTP response backed by owned bytes.
struct Response { /* opaque */ }
export type ResponseResult = Result(Response, Error);
impl Response {
  public fn parse (input: string) -> ResponseResult;
  public fn version (self: &Response) -> string;
  public fn status_code (self: &Response) -> int;
  public fn reason (self: &Response) -> string;
  public fn header (self: &Response, name: string) -> string?;
  public fn body (self: &Response) -> string;
  public fn write_body_to (self: &Response, dst: std::stream::WritableStream) -> Error?;
  public fn into_string (mut self: &Response) -> std::strings::String;
}

// A blocking connection wrapper that can read/write one message at a time.
struct Connection { /* opaque */ }
impl Connection {
  public fn from_stream (stream: std::net::TCPStream) -> Connection;
  public fn is_valid (self: &Connection) -> bool;
  public fn close (mut self: &Connection) -> Error?;

  // Client helpers.
  public fn write_request (self: &Connection, method: string, target: string, host: string, body: string) -> Error?;
  public fn write_request_with_headers (self: &Connection, method: string, target: string, host: string, headers: &HeadersMap, body: string) -> Error?;
  public fn read_response (mut self: &Connection) -> ResponseResult;

  // Server helpers.
  public fn read_request (mut self: &Connection) -> RequestResult;
  public fn write_response (self: &Connection, status: int, reason: string, body: string) -> Error?;
}

// One-shot client helpers.
export fn request (addr: std::net::SocketAddrV4, method: string, target: string, host: string, body: string) -> ResponseResult;
export fn request_v6 (addr: std::net::SocketAddrV6, method: string, target: string, host: string, body: string) -> ResponseResult;
export fn request_with_headers (addr: std::net::SocketAddrV4, method: string, target: string, host: string, headers: &HeadersMap, body: string) -> ResponseResult;
export fn request_v6_with_headers (addr: std::net::SocketAddrV6, method: string, target: string, host: string, headers: &HeadersMap, body: string) -> ResponseResult;
export async fn request_async (addr: std::net::SocketAddrV4, method: string, target: string, host: string, body: string) -> ResponseResult;
export async fn request_v6_async (addr: std::net::SocketAddrV6, method: string, target: string, host: string, body: string) -> ResponseResult;
export async fn request_with_headers_async (addr: std::net::SocketAddrV4, method: string, target: string, host: string, headers: HeadersMap, body: string) -> ResponseResult;
export async fn request_v6_with_headers_async (addr: std::net::SocketAddrV6, method: string, target: string, host: string, headers: HeadersMap, body: string) -> ResponseResult;

// URL and stream client helpers.
export fn request_url (url: string, method: string, body: string) -> ResponseResult;
export fn request_url_with_headers (url: string, method: string, headers: &HeadersMap, body: string) -> ResponseResult;
export fn request_url_from_stream (url: string, method: string, body: std::stream::ReadableStream) -> ResponseResult;
export fn request_url_from_stream_with_headers (url: string, method: string, headers: &HeadersMap, body: std::stream::ReadableStream) -> ResponseResult;
export fn request_url_to_stream (url: string, method: string, body: string, dst: std::stream::WritableStream) -> ResponseResult;
export fn request_url_to_stream_with_headers (url: string, method: string, headers: &HeadersMap, body: string, dst: std::stream::WritableStream) -> ResponseResult;
export fn request_url_stream (url: string, method: string, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ResponseResult;
export fn request_url_stream_with_headers (url: string, method: string, headers: &HeadersMap, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ResponseResult;
export async fn request_url_async (url: string, method: string, body: string) -> ResponseResult;
export async fn request_url_with_headers_async (url: string, method: string, headers: HeadersMap, body: string) -> ResponseResult;
export async fn request_url_from_stream_async (url: string, method: string, body: std::stream::ReadableStream) -> ResponseResult;
export async fn request_url_from_stream_with_headers_async (url: string, method: string, headers: HeadersMap, body: std::stream::ReadableStream) -> ResponseResult;
export async fn request_url_to_stream_async (url: string, method: string, body: string, dst: std::stream::WritableStream) -> ResponseResult;
export async fn request_url_to_stream_with_headers_async (url: string, method: string, headers: HeadersMap, body: string, dst: std::stream::WritableStream) -> ResponseResult;
export async fn request_url_stream_async (url: string, method: string, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ResponseResult;
export async fn request_url_stream_with_headers_async (url: string, method: string, headers: HeadersMap, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ResponseResult;
```

Notes:

- This API is currently blocking and uses `Connection: close` by default.
- `request_async(...)` / `request_v6_async(...)` are async-friendly wrappers,
 not a fully nonblocking HTTP transport. They run the blocking one-shot
 request path on a task worker so async code can `await` the result without
 blocking its executor owner thread.
- `request_url(...)` accepts absolute `http://...` URLs. It parses with
 `std::url`, uses port `80` when the URL has no explicit non-default port,
 resolves/connects with `std::net::TCPStream.connect_host(...)`, derives the
 request target from `path` + `?query`, and derives the `Host` header from the
 URL host and port.
- URL helpers reject missing hosts, parse failures, unsupported schemes, and
 cross-module schemes such as `https://...` with `ERR_BAD_URL`.
- `HeadersMap.from(...)` parses newline-delimited `Name: value` header text.
 Blank lines are ignored, a single trailing `\r` is accepted before `\n`, and
 names/values are ASCII-trimmed around the colon. Malformed nonblank lines,
 empty names, invalid header-name bytes, or embedded CR/LF in values produce
 `ERR_BAD_MESSAGE`.
- `HeadersMap.from_map(...)` copies entries from a
 `std::map::HashMap(string, string)`. `HeadersMap.from_set(...)` parses each
 `string` element of a `std::set::SetMap(string)` as one `Name: value` pair.
- `HeadersMap` stores borrowed `string` views. The source strings used by the
 constructors or `put(...)` must outlive the request that consumes the map.
- Header-aware request helpers append user headers after the generated `Host`
 header. `Host`, `Connection`, and `Content-Length` remain controlled by the
 transport and are not emitted from `HeadersMap`.
- Async header-aware helpers take ownership of the `HeadersMap` value passed to
 the task worker and drop its backing storage before returning.
- Stream helpers map `std::stream` failures to `ERR_STREAM`, except allocation
 failures which map to `ERR_OUT_OF_MEMORY`.
- Parsed messages own their backing bytes and return borrowed `string` views into
 those bytes; the returned views are valid until the message is dropped.
- `Response.into_string()` transfers ownership of the raw HTTP response bytes
 out of the parsed response object. After the transfer, the response handle is
 invalidated and should not be used again.

## Example (Client)

```silk
import http from "std/http";
import net from "std/net";

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

## Validation Rules

- `Content-Length` must parse as a non-negative decimal value.
- When `Transfer-Encoding` is present, only `"identity"` and `"chunked"` are
 accepted; other encodings fail with `ERR_UNSUPPORTED_TRANSFER_ENCODING`.
- Request/response header blocks are limited by `DEFAULT_MAX_HEADER_BYTES`
 (and per-connection configuration where applicable).
