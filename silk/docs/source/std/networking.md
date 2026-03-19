# `std::net`

Status: **Implemented subset**. A small endian/byte-order
helper subset plus hosted **IPv4/IPv6 TCP** and **IPv4/IPv6 UDP** socket APIs
are implemented in `std/net.slk`.

Async integration:

- `std::net` exposes async TCP `connect` and `accept` via:
  - `std::net::TCPStream.{connect_async,connect_v6_async}`
  - `std::net::TCPListener.accept_async`
- On `linux/*`, these are backed by the hosted async runtime (`docs/compiler/async-runtime.md`)
  with a `poll(2)` fallback backend and optional `io_uring` acceleration.
- On other targets, these `async fn` wrappers complete immediately by performing the
  blocking socket operation.
- Cancellation of in-flight socket operations is still follow-up work.

`std::net` provides networking primitives on POSIX systems.

Hostname resolution (DNS) integration:

- `std::net` provides `resolve_host(...)` and `TCPStream.connect_host(...)` helpers
  built on a small hosted POSIX `getaddrinfo(3)` shim.
- This is intended for common client-side use cases (HTTP/HTTPS/SSH) where
  code wants to connect to `host:port` without binding libc directly.
- The current implementation supports:
  - IPv4 (`A`) and IPv6 (`AAAA`) results, and
  - caller-controlled selection/order via `ResolveIpMode`.

See also:

- `docs/std/io.md` (shared I/O traits and error conventions)
- `docs/language/concurrency.md` (async/task model)
- `docs/std/conventions.md`
- `docs/std/http.md` (`std::http` on top of `std::net`)
- `docs/std/https.md` (`std::https` on top of `std::tls` + `std::net`)
- `docs/std/websocket.md` (`std::websocket` on top of `std::net`)

## Exported API

`std::net` starts with byte-order helpers and address types, then extends into
hosted socket APIs:

```silk
module std::net;

export fn bswap_u16 (x: u16) -> u16;
export fn bswap_u32 (x: u32) -> u32;

export fn htons (x: u16) -> u16;
export fn ntohs (x: u16) -> u16;
export fn htonl (x: u32) -> u32;
export fn ntohl (x: u32) -> u32;

struct Ipv4Addr {
  value: int,
}

impl Ipv4Addr {
  public fn from_octets (a: int, b: int, c: int, d: int) -> Ipv4Addr;
  public fn from_u32 (value: int) -> Ipv4Addr;
  public fn value (self: &Ipv4Addr) -> int;
  public fn a (self: &Ipv4Addr) -> int;
  public fn b (self: &Ipv4Addr) -> int;
  public fn c (self: &Ipv4Addr) -> int;
  public fn d (self: &Ipv4Addr) -> int;
  public fn is_loopback (self: &Ipv4Addr) -> bool;
}

// Compatibility wrappers (free functions).
export fn ipv4 (a: int, b: int, c: int, d: int) -> Ipv4Addr;
export fn ipv4_from_u32 (value: int) -> Ipv4Addr;

export fn ipv4_value (addr: Ipv4Addr) -> int;
export fn ipv4_a (addr: Ipv4Addr) -> int;
export fn ipv4_b (addr: Ipv4Addr) -> int;
export fn ipv4_c (addr: Ipv4Addr) -> int;
export fn ipv4_d (addr: Ipv4Addr) -> int;
export fn ipv4_is_loopback (addr: Ipv4Addr) -> bool;
```

Notes:

- This is currently implemented as a byte-swap for the `linux/x86_64`
  little-endian hosted baseline.

### TCP

`std::net` exposes a small TCP API for hosted targets via the
pluggable runtime interface `std::runtime::net`:

```silk
module std::net;

enum NetErrorKind {
  BadFileDescriptor,
  PermissionDenied,
  WouldBlock,
  Interrupted,
  ConnectionRefused,
  TimedOut,
  AddressInUse,
  AddressNotAvailable,
  NetworkUnreachable,
  HostUnreachable,
  NotConnected,
  BrokenPipe,
  InvalidInput,
  OutOfMemory,
  NameResolutionFailed,
  Unknown,
}

error NetFailed { code: int, requested: i64 }

export type NetIntResult = std::result::Result(int, NetFailed);

struct SocketAddrV4 {
  ip_value: int,
  port: int,
}

impl SocketAddrV4 {
  public fn from_ipv4_value (ip_value: int, port: int) -> SocketAddrV4;
  public fn from_octets (a: int, b: int, c: int, d: int, port: int) -> SocketAddrV4;
  public fn loopback (port: int) -> SocketAddrV4;
  public fn ip (self: &SocketAddrV4) -> Ipv4Addr;
  public fn port (self: &SocketAddrV4) -> int;
}

struct Ipv6Addr {
  hi: u64,
  lo: u64,
}

impl Ipv6Addr {
  public fn from_u64s (hi: u64, lo: u64) -> Ipv6Addr;
  public fn from_segments (s0: u16, s1: u16, s2: u16, s3: u16, s4: u16, s5: u16, s6: u16, s7: u16) -> Ipv6Addr;
  public fn hi (self: &Ipv6Addr) -> u64;
  public fn lo (self: &Ipv6Addr) -> u64;
  public fn is_loopback (self: &Ipv6Addr) -> bool;
  public fn is_unspecified (self: &Ipv6Addr) -> bool;
}

struct SocketAddrV6 {
  ip_hi: u64,
  ip_lo: u64,
  port: int,
  scope_id: int,
}

impl SocketAddrV6 {
  public fn from_ipv6_u64s (ip_hi: u64, ip_lo: u64, port: int, scope_id: int) -> SocketAddrV6;
  public fn from_ipv6 (ip: Ipv6Addr, port: int, scope_id: int) -> SocketAddrV6;
  public fn loopback (port: int) -> SocketAddrV6;
  public fn ip (self: &SocketAddrV6) -> Ipv6Addr;
  public fn port (self: &SocketAddrV6) -> int;
  public fn scope_id (self: &SocketAddrV6) -> int;
}

struct TCPStream {
  fd: int,
}

export type TCPStreamResult = std::result::Result(TCPStream, NetFailed);

impl TCPStream {
  public fn invalid () -> TCPStream;
  public fn is_valid (self: &TCPStream) -> bool;
  public fn connect (addr: SocketAddrV4) -> TCPStreamResult;
  public fn connect_v6 (addr: SocketAddrV6) -> TCPStreamResult;
  public async fn connect_async (addr: SocketAddrV4) -> TCPStreamResult;
  public async fn connect_v6_async (addr: SocketAddrV6) -> TCPStreamResult;

  // Hostname resolution + connect-by-host helpers.
  public fn connect_host (host: string, port: int) -> TCPStreamResult;
  public fn connect_host_mode (host: string, port: int, mode: ResolveIpMode) -> TCPStreamResult;
  public async fn connect_host_async (host: string, port: int) -> TCPStreamResult;
  public async fn connect_host_mode_async (host: string, port: int, mode: ResolveIpMode) -> TCPStreamResult;

  public fn close (mut self: &TCPStream) -> NetFailed?;
  public fn read (self: &TCPStream, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn write (self: &TCPStream, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn write_all (self: &TCPStream, buf: std::arrays::ByteSlice) -> NetFailed?;
  public fn write_string (self: &TCPStream, s: string) -> NetFailed?;
  public fn shutdown_read (self: &TCPStream) -> NetFailed?;
  public fn shutdown_write (self: &TCPStream) -> NetFailed?;
  public fn shutdown (self: &TCPStream) -> NetFailed?;
}

enum ResolveIpMode {
  Any,
  PreferV4,
  PreferV6,
  V4Only,
  V6Only,
}

export type ResolveAddrsResult = std::result::Result(std::vector::Vector(SocketAddr), NetFailed);

export fn resolve_host (host: string, port: int, mode: ResolveIpMode) -> ResolveAddrsResult;

struct TCPListener {
  fd: int,
}

export type TCPListenerResult = std::result::Result(TCPListener, NetFailed);

impl TCPListener {
  public fn invalid () -> TCPListener;
  public fn is_valid (self: &TCPListener) -> bool;
  public fn listen (addr: SocketAddrV4, backlog: int) -> TCPListenerResult;
  public fn listen_v6 (addr: SocketAddrV6, backlog: int) -> TCPListenerResult;
  public fn accept (self: &TCPListener) -> TCPStreamResult;
  public async fn accept_async (self: &TCPListener) -> TCPStreamResult;
  public fn local_port (self: &TCPListener) -> NetIntResult;
  public fn local_port_v6 (self: &TCPListener) -> NetIntResult;
  public fn close (mut self: &TCPListener) -> NetFailed?;
}
```

Notes:

- This API is currently **mostly blocking** (only `connect_async` and
  `accept_async` are integrated with the hosted event loop today).
- This module targets hosted `linux/x86_64` via `std::runtime::net`
  (POSIX sockets); `wasm32-wasi` has no Preview 1 sockets, so the runtime
  stubs return error values.
- `TCPStream`/`TCPListener` wrap raw file descriptors; avoid copying these
  values until the language has move-only handle types.
- If you want to discard error details, prefer `match (r)` when the `Result`
  payload may implement `Drop` (for example `TCPStream` / `TCPListener`), since
  `ResultType.ok_value(r)` copies the `Result` payload in the current subset.
- `std::net::stream` provides task-based adapters that connect `TCPStream` with
  `std::stream` using producer/consumer loops:
  - `std::net::stream::pipe_tcpstream_to_stream` / `pipe_tcpstream_to_stream_abortable`
  - `std::net::stream::pipe_stream_to_tcpstream` / `pipe_stream_to_tcpstream_abortable`
  These adapters take ownership of the `TCPStream` and close it before returning.

### UDP

`std::net` also exposes a small UDP API for hosted targets. The API is
datagram-oriented but remains blocking.

```silk
module std::net;

struct UDPSocket {
  fd: int,
  domain: int,
}

export type NetError = NetFailed;
export type UDPSocketResult = std::result::Result(UDPSocket, NetFailed);

struct UDPRecvFrom {
  n: int,
  addr: SocketAddr,
}

export type UDPRecvFromResult = std::result::Result(UDPRecvFrom, NetError);

struct SocketAddr {
  domain: int,
  ip_value: int,
  ip_hi: u64,
  ip_lo: u64,
  port: int,
  scope_id: int,
}

impl SocketAddr {
  public fn from_v4 (addr: SocketAddrV4) -> SocketAddr;
  public fn from_v6 (addr: SocketAddrV6) -> SocketAddr;
  public fn is_v4 (self: &SocketAddr) -> bool;
  public fn is_v6 (self: &SocketAddr) -> bool;
  public fn v4 (self: &SocketAddr) -> SocketAddrV4?;
  public fn v6 (self: &SocketAddr) -> SocketAddrV6?;
  public fn port (self: &SocketAddr) -> int;
}

impl UDPSocket {
  public fn invalid () -> UDPSocket;
  public fn is_valid (self: &UDPSocket) -> bool;

  public fn bind_v4 (addr: SocketAddrV4) -> UDPSocketResult;
  public fn bind_v6 (addr: SocketAddrV6) -> UDPSocketResult;

  public fn connect_v4 (addr: SocketAddrV4) -> UDPSocketResult;
  public fn connect_v6 (addr: SocketAddrV6) -> UDPSocketResult;

  public fn local_port (self: &UDPSocket) -> NetIntResult;
  public fn close (mut self: &UDPSocket) -> NetFailed?;

  // Connected I/O (uses `read(2)` / `write(2)`).
  public fn read (self: &UDPSocket, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn write (self: &UDPSocket, buf: std::arrays::ByteSlice) -> NetIntResult;

  // Unconnected datagrams.
  public fn send_to (self: &UDPSocket, addr: SocketAddr, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn recv_from (self: &UDPSocket, buf: std::arrays::ByteSlice) -> UDPRecvFromResult;
}
```

Notes:

- `send_to` / `recv_from` require the socket domain to match `addr.domain`
  (`AF_INET` for IPv4, `AF_INET6` for IPv6).

## Examples

### Address construction and normalization

```silk
import std::net;

fn main () -> int {
  let loopback = std::net::SocketAddrV4.loopback(8080);
  let any = std::net::SocketAddr.from_v4(loopback);

  if !loopback.ip().is_loopback() { return 1; }
  if !any.is_v4() { return 2; }
  if any.port() != 8080 { return 3; }

  return 0;
}
```

## Considerations

### Scope

`std::net` is responsible for:

- Sockets and basic protocols.
- Integration with concurrency primitives (`async`, `task`).

### Design shape

- `IpAddr` (`V4` / `V6`) and `SocketAddr`.
- `TCPStream`, `TCPListener`, `UDPSocket`.

Illustrative sketch:

```silk
module std::net;

export enum NetError {
  ConnectionRefused,
  TimedOut,
  AddressInUse,
  NetworkUnreachable,
  WouldBlock,
  Unknown,
}

export fn tcp_connect (addr: SocketAddr) -> Result(TCPStream, NetError);
export fn tcp_listen (addr: SocketAddr) -> Result(TCPListener, NetError);
```

### Blocking and async behavior

The shipped hosted subset now includes both:

- blocking socket operations for the baseline TCP/UDP surface, and
- async TCP connect/accept wrappers integrated with the hosted event loop.

Remaining expansion areas include:

- broader async coverage for additional socket operations,
- cancellation of in-flight socket operations,
- and higher-level blocking-offload helpers if the std/task surface grows a
  dedicated `run_blocking()`-style API.

## See also

- [`std::io`](?p=std/io)
- [`std::stream`](?p=std/stream)
- [`std::http`](?p=std/http)
- [`std::https`](?p=std/https)
- [Concurrency](?p=language/concurrency)

## Design goals

- DNS resolution, TLS integration (as optional packages).
