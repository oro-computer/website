# `std::https`

Status: **Implemented (hosted, blocking; HTTPS subset)**. `std::https` provides a
small HTTPS client/server connection API on top of `std::tls` (mbedTLS) and
`std::net::TcpStream`.

See also:

- `docs/std/http.md` (`std::http` message parsing/serialization)
- `docs/std/tls.md` (`std::tls` TLS sessions and transport integration)
- RFC 2818 (HTTP over TLS)

## Scope (Current)

Implemented:

- Blocking TLS handshake using `std::tls::Session`.
- HTTPS request/response I/O using the same message model as `std::http`.

Not implemented (yet):

- Certificate verification (CA store), hostname verification, and SNI/ALPN
  configuration beyond current defaults.
- Non-blocking integration with an async runtime.

## Public API (Current Compiler Subset)

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
  public fn is_valid (self: &Server) -> bool;
  public fn local_port (self: &Server) -> std::net::NetIntResult;
  public fn accept (mut self: &Server) -> ConnectionResult;
  public fn close (mut self: &Server) -> Error?;
}
```

Notes:

- This API is blocking and intended for the hosted POSIX baseline.
- For now, TLS configuration uses current defaults and does not verify
  certificates; this will be tightened as `std::tls` grows.
