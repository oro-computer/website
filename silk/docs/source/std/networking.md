# `std::net`

Status: **Implemented subset**. A small endian/byte-order
helper subset plus hosted **IPv4/IPv6 TCP** and **IPv4/IPv6 UDP** socket APIs
are implemented in `std/net.slk`. Async/event-loop integration remains future
work.

`std::net` provides networking primitives on POSIX systems.

See also:

- `docs/std/io.md` (shared I/O traits and error conventions)
- `docs/language/concurrency.md` (async/task model)
- `docs/std/conventions.md`
- `docs/std/http.md` (`std::http` on top of `std::net`)
- `docs/std/https.md` (`std::https` on top of `std::tls` + `std::net`)
- `docs/std/websocket.md` (`std::websocket` on top of `std::net`)

## Implemented API

A small, non-socket subset exists in `std/net.slk` for early bring-up:

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

## Hosted TCP API (Implemented)

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

struct TcpStream {
  fd: int,
}

export type TcpStreamResult = std::result::Result(TcpStream, NetFailed);

impl TcpStream {
  public fn invalid () -> TcpStream;
  public fn is_valid (self: &TcpStream) -> bool;
  public fn connect (addr: SocketAddrV4) -> TcpStreamResult;
  public fn connect_v6 (addr: SocketAddrV6) -> TcpStreamResult;
  public fn close (mut self: &TcpStream) -> NetFailed?;
  public fn read (self: &TcpStream, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn write (self: &TcpStream, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn write_all (self: &TcpStream, buf: std::arrays::ByteSlice) -> NetFailed?;
  public fn write_string (self: &TcpStream, s: string) -> NetFailed?;
  public fn shutdown_read (self: &TcpStream) -> NetFailed?;
  public fn shutdown_write (self: &TcpStream) -> NetFailed?;
  public fn shutdown (self: &TcpStream) -> NetFailed?;
}

struct TcpListener {
  fd: int,
}

export type TcpListenerResult = std::result::Result(TcpListener, NetFailed);

impl TcpListener {
  public fn invalid () -> TcpListener;
  public fn is_valid (self: &TcpListener) -> bool;
  public fn listen (addr: SocketAddrV4, backlog: int) -> TcpListenerResult;
  public fn listen_v6 (addr: SocketAddrV6, backlog: int) -> TcpListenerResult;
  public fn accept (self: &TcpListener) -> TcpStreamResult;
  public fn local_port (self: &TcpListener) -> NetIntResult;
  public fn local_port_v6 (self: &TcpListener) -> NetIntResult;
  public fn close (mut self: &TcpListener) -> NetFailed?;
}
```

Notes:

- This API is currently **blocking** (no non-blocking sockets/event loop yet).
- This module targets hosted `linux/x86_64` via `std::runtime::net`
  (POSIX sockets); `wasm32-wasi` has no Preview 1 sockets, so the runtime
  stubs return error values.
- `TcpStream`/`TcpListener` wrap raw file descriptors; avoid copying these
  values until the language has move-only handle types.
- If you want to discard error details, prefer `match (r)` when the `Result`
  payload may implement `Drop` (for example `TcpStream` / `TcpListener`), since
  `ResultType.ok_value(r)` copies the `Result` payload in the current subset.
- `std::net::stream` provides task-based adapters that connect `TcpStream` with
  `std::stream` using producer/consumer loops:
  - `std::net::stream::pipe_tcpstream_to_stream` / `pipe_tcpstream_to_stream_abortable`
  - `std::net::stream::pipe_stream_to_tcpstream` / `pipe_stream_to_tcpstream_abortable`
  These adapters take ownership of the `TcpStream` and close it before returning.

## Hosted UDP API (Implemented)

`std::net` also exposes a small UDP API for hosted targets. The API is
datagram-oriented but remains blocking.

```silk
module std::net;

struct UdpSocket {
  fd: int,
  domain: int,
}

export type NetError = NetFailed;
export type UdpSocketResult = std::result::Result(UdpSocket, NetFailed);

struct UdpRecvFrom {
  n: int,
  addr: SocketAddr,
}

export type UdpRecvFromResult = std::result::Result(UdpRecvFrom, NetError);

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

impl UdpSocket {
  public fn invalid () -> UdpSocket;
  public fn is_valid (self: &UdpSocket) -> bool;

  public fn bind_v4 (addr: SocketAddrV4) -> UdpSocketResult;
  public fn bind_v6 (addr: SocketAddrV6) -> UdpSocketResult;

  public fn connect_v4 (addr: SocketAddrV4) -> UdpSocketResult;
  public fn connect_v6 (addr: SocketAddrV6) -> UdpSocketResult;

  public fn local_port (self: &UdpSocket) -> NetIntResult;
  public fn close (mut self: &UdpSocket) -> NetFailed?;

  // Connected I/O (uses `read(2)` / `write(2)`).
  public fn read (self: &UdpSocket, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn write (self: &UdpSocket, buf: std::arrays::ByteSlice) -> NetIntResult;

  // Unconnected datagrams.
  public fn send_to (self: &UdpSocket, addr: SocketAddr, buf: std::arrays::ByteSlice) -> NetIntResult;
  public fn recv_from (self: &UdpSocket, buf: std::arrays::ByteSlice) -> UdpRecvFromResult;
}
```

Notes:

- `send_to` / `recv_from` require the socket domain to match `addr.domain`
  (`AF_INET` for IPv4, `AF_INET6` for IPv6).

## Scope

`std::net` is responsible for:

- Sockets and basic protocols.
- Integration with concurrency primitives (`async`, `task`).

## Core Types (Initial Design)

- `IpAddr` (`V4` / `V6`) and `SocketAddr`.
- `TcpStream`, `TcpListener`, `UdpSocket`.

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

export fn tcp_connect (addr: SocketAddr) -> Result(TcpStream, NetError);
export fn tcp_listen (addr: SocketAddr) -> Result(TcpListener, NetError);
```

## Blocking vs Async

The initial hosted baseline may be blocking I/O. Once the language’s async
model is implemented, `std::net` should provide:

- non-blocking sockets + integration with an event loop,
- `async fn` wrappers for common operations,
- integration with task offloading for blocking adapters (design target:
  `std::task::run_blocking()`; until that exists, users can explicitly use a
  `task fn` wrapper around blocking calls).

## Future Work

- DNS resolution, TLS integration (as optional packages).
