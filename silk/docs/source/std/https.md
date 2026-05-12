# `std::https`

`std::https` provides a
small HTTPS client/server connection API on top of `std::tls` (mbedTLS) and
`std::net::TCPStream`, plus URL and stream convenience helpers.

See also:

- [http](?p=std/http) (`std::http` message parsing/serialization)
- [tls](?p=std/tls) (`std::tls` TLS sessions and transport integration)
- [stream](?p=std/stream) (`std::stream` byte streams)
- [url](?p=std/url) (`std::url` parsing and serialization)
- RFC 2818 (HTTP over TLS)

## Scope
Implemented:

- Blocking TLS handshake using `std::tls::Session`.
- Authenticated HTTPS client sessions via `Connection.connect_host(...)` using a
 system CA bundle + hostname verification.
- HTTPS request/response I/O using the same message model as `std::http`.
- One-shot HTTPS client helpers:
 - blocking: `request_host(...)`, `request_host_v6(...)`
 - async-friendly: `request_host_async(...)`, `request_host_v6_async(...)`
- URL-based HTTPS client helpers:
 - blocking: `request_url(...)`
 - async-friendly: `request_url_async(...)`
- Header maps from `std::http::HeadersMap` for custom request headers.
- Stream convenience helpers:
 - blocking:
 `request_url_from_stream(...)`, `request_url_to_stream(...)`,
 `request_url_stream(...)`
 - async-friendly:
 `request_url_from_stream_async(...)`, `request_url_to_stream_async(...)`,
 `request_url_stream_async(...)`

Not implemented (yet):

- ALPN configuration and HTTP/2 negotiation.
- Non-blocking integration with an async runtime.
- Fully incremental streaming bodies. The stream helpers bridge
 `std::stream` to the current owned-message implementation: request streams
 are collected before sending, and response bodies are written to output
 streams after the response has been parsed.

## Exported API

```silk
module std::https;

import std::http;
import std::net;
import std::result;

export let ERR_CONNECT: int = 1;
export let ERR_TLS: int = 2;
export let ERR_IO: int = 3;
export let ERR_HTTP: int = 4;
export let ERR_OUT_OF_MEMORY: int = 5;
export let ERR_BAD_URL: int = 6;
export let ERR_STREAM: int = 7;

export error Error {
  kind: int,
}

export type ClientResponseResult = std::result::Result(std::http::Response, Error);

struct Connection { /* opaque */ }
export type ConnectionResult = std::result::Result(Connection, Error);
impl Connection {
  // Establish TCP, then perform a TLS client handshake.
  public fn connect (addr: std::net::SocketAddrV4) -> ConnectionResult;
  public fn connect_v6 (addr: std::net::SocketAddrV6) -> ConnectionResult;

  // Like `connect`, but configures SNI + hostname verification (recommended).
  public fn connect_host (addr: std::net::SocketAddrV4, hostname: string) -> ConnectionResult;
  public fn connect_host_v6 (addr: std::net::SocketAddrV6, hostname: string) -> ConnectionResult;
  public fn is_valid (self: &Connection) -> bool;
  public fn close (mut self: &Connection) -> Error?;

  public fn write_request (self: &Connection, method: string, target: string, host: string, body: string) -> Error?;
  public fn write_request_with_headers (self: &Connection, method: string, target: string, host: string, headers: &std::http::HeadersMap, body: string) -> Error?;
  public fn read_request (mut self: &Connection) -> http::RequestResult;
  public fn write_response (self: &Connection, status: int, reason: string, body: string) -> Error?;
  public fn read_response (mut self: &Connection) -> http::ResponseResult;
}

struct Server { /* opaque */ }
export type ServerResult = std::result::Result(Server, Error);
impl Server {
  // Listen on TCP, accept, then perform a TLS server handshake with the provided
  // certificate and private key (PEM).
  public fn listen (addr: std::net::SocketAddrV4, backlog: int, cert_pem: string, key_pem: string) -> ServerResult;
  public fn listen_v6 (addr: std::net::SocketAddrV6, backlog: int, cert_pem: string, key_pem: string) -> ServerResult;
  public fn is_valid (self: &Server) -> bool;
  public fn local_port (self: &Server) -> std::net::NetIntResult;
  public fn accept (mut self: &Server) -> ConnectionResult;
  public fn close (mut self: &Server) -> Error?;
}

// One-shot client helpers.
export fn request_host (addr: std::net::SocketAddrV4, hostname: string, method: string, target: string, body: string) -> ClientResponseResult;
export fn request_host_v6 (addr: std::net::SocketAddrV6, hostname: string, method: string, target: string, body: string) -> ClientResponseResult;
export fn request_host_with_headers (addr: std::net::SocketAddrV4, hostname: string, method: string, target: string, headers: &std::http::HeadersMap, body: string) -> ClientResponseResult;
export fn request_host_v6_with_headers (addr: std::net::SocketAddrV6, hostname: string, method: string, target: string, headers: &std::http::HeadersMap, body: string) -> ClientResponseResult;
export async fn request_host_async (addr: std::net::SocketAddrV4, hostname: string, method: string, target: string, body: string) -> ClientResponseResult;
export async fn request_host_v6_async (addr: std::net::SocketAddrV6, hostname: string, method: string, target: string, body: string) -> ClientResponseResult;
export async fn request_host_with_headers_async (addr: std::net::SocketAddrV4, hostname: string, method: string, target: string, headers: std::http::HeadersMap, body: string) -> ClientResponseResult;
export async fn request_host_v6_with_headers_async (addr: std::net::SocketAddrV6, hostname: string, method: string, target: string, headers: std::http::HeadersMap, body: string) -> ClientResponseResult;

// URL and stream client helpers.
export fn request_url (url: string, method: string, body: string) -> ClientResponseResult;
export fn request_url_with_headers (url: string, method: string, headers: &std::http::HeadersMap, body: string) -> ClientResponseResult;
export fn request_url_from_stream (url: string, method: string, body: std::stream::ReadableStream) -> ClientResponseResult;
export fn request_url_from_stream_with_headers (url: string, method: string, headers: &std::http::HeadersMap, body: std::stream::ReadableStream) -> ClientResponseResult;
export fn request_url_to_stream (url: string, method: string, body: string, dst: std::stream::WritableStream) -> ClientResponseResult;
export fn request_url_to_stream_with_headers (url: string, method: string, headers: &std::http::HeadersMap, body: string, dst: std::stream::WritableStream) -> ClientResponseResult;
export fn request_url_stream (url: string, method: string, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ClientResponseResult;
export fn request_url_stream_with_headers (url: string, method: string, headers: &std::http::HeadersMap, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ClientResponseResult;
export async fn request_url_async (url: string, method: string, body: string) -> ClientResponseResult;
export async fn request_url_with_headers_async (url: string, method: string, headers: std::http::HeadersMap, body: string) -> ClientResponseResult;
export async fn request_url_from_stream_async (url: string, method: string, body: std::stream::ReadableStream) -> ClientResponseResult;
export async fn request_url_from_stream_with_headers_async (url: string, method: string, headers: std::http::HeadersMap, body: std::stream::ReadableStream) -> ClientResponseResult;
export async fn request_url_to_stream_async (url: string, method: string, body: string, dst: std::stream::WritableStream) -> ClientResponseResult;
export async fn request_url_to_stream_with_headers_async (url: string, method: string, headers: std::http::HeadersMap, body: string, dst: std::stream::WritableStream) -> ClientResponseResult;
export async fn request_url_stream_async (url: string, method: string, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ClientResponseResult;
export async fn request_url_stream_with_headers_async (url: string, method: string, headers: std::http::HeadersMap, body: std::stream::ReadableStream, dst: std::stream::WritableStream) -> ClientResponseResult;
```

Notes:

- This API is blocking and intended for the hosted POSIX baseline.
- `connect_host(...)` / `connect_host_v6(...)` perform certificate chain
 verification using a system CA bundle and enable hostname verification by
 calling `std::tls::Session.set_hostname(...)` before the handshake.
- `request_host_async(...)` / `request_host_v6_async(...)` are async-friendly
 wrappers, not a fully nonblocking TLS transport. They run the blocking
 one-shot HTTPS path on a task worker so async code can `await` the result
 without blocking its executor owner thread.
- `request_url(...)` accepts absolute `https://...` URLs. It parses with
 `std::url`, uses port `443` when the URL has no explicit non-default port,
 resolves/connects with `std::net::resolve_host(...)`, establishes a verified
 TLS session with SNI/hostname verification, derives the request target from
 `path` + `?query`, and derives the `Host` header from the URL host and port.
- URL helpers reject missing hosts, parse failures, unsupported schemes, and
 cross-module schemes such as `http://...` with `ERR_BAD_URL`.
- Header-aware helpers consume `std::http::HeadersMap`, use the same validation
 and constructor semantics documented by `std::http`, and keep `Host`,
 `Connection`, and `Content-Length` controlled by the TLS request writer.
- Async header-aware helpers take ownership of the `HeadersMap` value passed to
 the task worker and drop its backing storage before returning.
- Stream helpers map `std::stream` failures to `ERR_STREAM`, except allocation
 failures which map to `ERR_OUT_OF_MEMORY`.
