# `std::https`

Status: **Implemented (hosted, blocking; HTTPS subset)**. `std::https` provides a
small HTTPS client/server connection API on top of `std::tls` (mbedTLS) and
`std::net::TCPStream`.

## Description

Implemented:

- Blocking TLS handshake using `std::tls::Session`.
- Authenticated HTTPS client sessions via `Connection.connect_host(...)` using a
  system CA bundle + hostname verification.
- HTTPS request/response I/O using the same message model as `std::http`.

Not implemented (yet):

- ALPN configuration and HTTP/2 negotiation.
- Non-blocking integration with an async runtime.

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

export error Error {
  kind: int,
}

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
```

### Errors

- `ERR_CONNECT`
- `ERR_TLS`
- `ERR_IO`
- `ERR_HTTP`
- `ERR_OUT_OF_MEMORY`
- `Error`

### Client connection

- `Connection.connect(addr)`
- `Connection.connect_v6(addr)`
- `Connection.connect_host(addr, hostname)`
- `Connection.connect_host_v6(addr, hostname)`
- `is_valid()`, `close()`
- `write_request(...)`, `read_request()`, `write_response(...)`, `read_response()`

### Server

- `Server.listen(...)`
- `Server.listen_v6(...)`
- `is_valid()`
- `local_port()`
- `accept()`
- `close()`

## Examples

### Connect with hostname verification

```silk
import std::https;
import std::net;

fn main () -> int {
  let addr = std::net::SocketAddrV4.loopback(443);
  let conn = match std::https::Connection.connect_host(addr, "localhost") {
    Ok(v) => v,
    Err(err) => return if err.kind == std::https::ERR_CONNECT { 0 } else { 1 },
  };

  if !conn.is_valid() {
    return 2;
  }

  return 0;
}
```

## Considerations

- This API is blocking and intended for the hosted POSIX baseline.
- `connect_host(...)` / `connect_host_v6(...)` perform certificate chain
  verification using a system CA bundle and enable hostname verification by
  calling `std::tls::Session.set_hostname(...)` before the handshake.

## See also

- [`std::http`](?p=std/http)
- [`std::tls`](?p=std/tls)
- RFC 2818
