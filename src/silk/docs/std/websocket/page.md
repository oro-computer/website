---
layout: "docs"
description: "std::websocket provides an RFC 6455 WebSocket implementation on top of std::net::TCPStream, with an optional owned std::tls::Session for wss:// clients and TLS loopback/server use (client + server han"
docsCollection: "silk"
section: "std"
order: 110
sourcePath: "std/websocket.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::websocket`](/silk/docs/std/websocket/)

[`std::websocket`](/silk/docs/std/websocket/) provides an RFC 6455 WebSocket implementation on top of
[`std::net::TCPStream`](/silk/docs/std/net/), with an optional owned [`std::tls::Session`](/silk/docs/std/tls/) for `wss://`
clients and TLS loopback/server use (client + server handshake, framing,
ping/pong, close, fragmentation).

See also:

- [networking](/silk/docs/std/networking/) ([`std::net`](/silk/docs/std/net/) sockets)
- RFC 6455: The WebSocket Protocol (wire format + handshake)

## Overview

[`std::websocket`](/silk/docs/std/websocket/) is a protocol layer that upgrades an HTTP/1.1 connection to a
WebSocket and then sends/receives WebSocket frames.

Design goals:

- Work for hosted POSIX builds using [`std::net`](/silk/docs/std/net/).
- Provide a verified secure client using either the system trust store or an
 explicit PEM CA bundle, with SNI and certificate hostname verification.
- Bound DNS, connect, TLS handshake, HTTP upgrade, message read/write, close,
 header buffering, and complete-message buffering independently.
- Be fully interoperable with other WebSocket implementations (browsers,
 Node.js, etc.) for the supported feature set:
 - version 13 handshake,
 - masked client→server frames,
 - unmasked server→client frames,
 - fragmentation and continuation frames,
 - ping/pong, close.
- Provide a small, blocking server that accepts one connection at a time.

Non-goals (for now):

- HTTP server integration beyond the upgrade handshake (no HTTP routing layer).
- Per-message compression (RSV1 / `permessage-deflate`).

## Exported API

```silk
module std::websocket;

import std::net;
import std::arrays;
import std::result;
import std::strings;

// Message opcodes (subset).
export let OPCODE_TEXT: int = 1;
export let OPCODE_BINARY: int = 2;

// Handshake errors.
export let ERR_HANDSHAKE_IO: int = 1;
export let ERR_HANDSHAKE_TOO_LARGE: int = 2;
export let ERR_HANDSHAKE_BAD_REQUEST: int = 3;
export let ERR_HANDSHAKE_MISSING_KEY: int = 4;
export let ERR_HANDSHAKE_BAD_VERSION: int = 5;
export let ERR_HANDSHAKE_BAD_ACCEPT: int = 6;
export let ERR_HANDSHAKE_OUT_OF_MEMORY: int = 7;
export let ERR_HANDSHAKE_TIMEOUT: int = 8;
export let ERR_HANDSHAKE_TLS: int = 9;
export let ERR_HANDSHAKE_INVALID_OPTIONS: int = 10;
export let ERR_HANDSHAKE_DNS: int = 11;
export let ERR_HANDSHAKE_CONNECT: int = 12;

export error HandshakeError {
  kind: int,
}

export type WebSocketResult = std::result::Result(WebSocket, HandshakeError);
export type WebSocketServerResult = std::result::Result(WebSocketServer, HandshakeError);

// Protocol/runtime errors during frame processing.
export let ERR_PROTOCOL_IO: int = 1;
export let ERR_PROTOCOL_CLOSED: int = 2;
export let ERR_PROTOCOL_BAD_FRAME: int = 3;
export let ERR_PROTOCOL_TOO_LARGE: int = 4;
export let ERR_PROTOCOL_OUT_OF_MEMORY: int = 5;
export let ERR_PROTOCOL_TIMEOUT: int = 6;

export error ProtocolError {
  kind: int,
}

export type MessageResult = std::result::Result(Message, ProtocolError);

struct Message {
  opcode: int,              // OPCODE_TEXT or OPCODE_BINARY
  data: std::strings::String, // owned bytes (UTF-8 for text)
}

struct WebSocket {
  // opaque handle
}

struct ConnectOptions {
  dns_timeout_ms: int;
  connect_timeout_ms: int;
  tls_handshake_timeout_ms: int;
  upgrade_timeout_ms: int;
  read_timeout_ms: int;
  write_timeout_ms: int;
  close_timeout_ms: int;
  max_header_bytes: i64;
  max_message_bytes: i64;
}

impl ConnectOptions {
  public fn defaults () -> ConnectOptions;
  public fn is_valid (self: &ConnectOptions) -> bool;
}

impl WebSocket {
  // Server-side: perform the HTTP upgrade handshake on an accepted TCP stream.
  public fn accept (stream: std::net::TCPStream) -> WebSocketResult;

  // Client-side: connect and perform the HTTP upgrade handshake.
  public fn connect (addr: SocketAddrV4, host: string, path: string) -> WebSocketResult;

  // Verified system-trust TLS with bounded default options.
  public fn connect_secure (addr: SocketAddrV4, host: string, path: string) -> WebSocketResult;

  // Verified system trust or caller-provided CA, with explicit limits.
  public fn connect_secure_with_options (addr: SocketAddrV4, host: string, path: string, options: ConnectOptions) -> WebSocketResult;
  public fn connect_secure_ca_pem (addr: SocketAddrV4, host: string, path: string, ca_pem: string, options: ConnectOptions) -> WebSocketResult;

  // Resolve with a bounded DNS phase, then try resolved addresses within one
  // bounded connect phase before TLS and HTTP upgrade.
  public fn connect_secure_host (host: string, port: int, path: string, options: ConnectOptions) -> WebSocketResult;
  public fn connect_secure_host_ca_pem (host: string, port: int, path: string, ca_pem: string, options: ConnectOptions) -> WebSocketResult;

  // Server/test composition over an already accepted stream.
  public fn accept_secure (stream: std::net::TCPStream, cert_pem: string, key_pem: string, options: ConnectOptions) -> WebSocketResult;

  public fn is_valid (self: &WebSocket) -> bool;
  public fn close (mut self: &WebSocket) -> ProtocolError?;

  // Read the next complete application message (text or binary).
  // Ping frames are answered automatically and do not surface as messages.
  public fn read_message (mut self: &WebSocket) -> MessageResult;

  // Send a single unfragmented message.
  public fn write_text (self: &WebSocket, text: string) -> ProtocolError?;
  public fn write_bytes (self: &WebSocket, bytes: std::arrays::ByteSlice) -> ProtocolError?;

  // Send one ping control frame with at most 125 payload bytes.
  public fn ping (self: &WebSocket, payload: std::arrays::ByteSlice) -> ProtocolError?;
}

struct WebSocketServer {
  // opaque handle
}

impl WebSocketServer {
  public fn listen (addr: SocketAddrV4, backlog: int) -> WebSocketServerResult;
  public fn is_valid (self: &WebSocketServer) -> bool;
  public fn local_port (self: &WebSocketServer) -> std::net::NetIntResult;
  public fn accept (mut self: &WebSocketServer) -> WebSocketResult;
  public fn accept_secure (mut self: &WebSocketServer, cert_pem: string, key_pem: string, options: ConnectOptions) -> WebSocketResult;
  public fn close (mut self: &WebSocketServer) -> HandshakeError?;
}
```

Notes:

- This API is **blocking**. Every secure phase has a positive finite deadline;
 no secure operation renews its deadline after partial progress.
- `ConnectOptions.defaults()` uses finite production-safe bounds. Supplying a
 zero/negative deadline or non-positive header/message limit is rejected with
 `ERR_HANDSHAKE_INVALID_OPTIONS`; secure operations never interpret zero as an
 unbounded wait. Client host/path inputs must be non-empty, fit the configured
 header bound, contain no HTTP control/space bytes, and use an absolute path
 beginning with `/`; invalid inputs are rejected before opening a connection.
- `connect_secure` is the convenience system-trust form. The explicit options
 forms retain hostname verification and never permit a verification-disabled
 TLS client. `connect_secure_ca_pem` and `connect_secure_host_ca_pem` trust only
 the supplied CA bundle.
- The address-taking forms assume DNS was performed by the caller. The
 `connect_secure_host*` forms perform `resolve_host_timeout`, use one monotonic
 deadline across all resolved-address connection attempts, and then apply
 separate TLS and HTTP-upgrade deadlines.
- `accept` consumes its `TCPStream`, and a successful `WebSocket` owns that
 stream until `close` or `Drop` invalidates it.
- Secure accept/connect additionally transfer one [`std::tls::Session`](/silk/docs/std/tls/) into the
 same `WebSocket`. On every failure, close, or drop path the session is released
 before the retained descriptor is closed; no background task or detached
 owner survives. A caller cancels further work by closing/dropping the owner,
 while an in-flight blocking phase terminates at its configured deadline.
- Handshake computation and writes borrow the stream retained inside the
 `WebSocket`; they do not create a second owning stream handle. Consequently,
 every handshake error path can close the original owner exactly once.
- `WebSocket` and `WebSocketServer` are ownership-tracked handles. Moving one
 transfers its wrapped OS resources, and copying an owning handle is rejected.

## Protocol Rules Enforced

The implementation enforces the following RFC 6455 requirements:

- Client→server frames **must** be masked; server→client frames **must not** be masked.
- Reserved bits (RSV1/2/3) must be zero (compression/extensions are not supported).
- Control frames (ping/pong/close):
 - are not allowed to be fragmented (`FIN = 1`),
 - must have payload length ≤ 125,
 - reject non-minimal payload-length encodings, one-byte close payloads, and
 close status codes that RFC 6455 forbids on the wire.
- Close frames trigger an attempted close reply and then the connection is
 treated as closed from the API’s perspective.
- `max_message_bytes` applies both to individual frame payloads and the
 cumulative payload of a fragmented message. `max_header_bytes` applies to the
 complete HTTP upgrade header before any post-upgrade bytes are retained. The
 receive buffer never grows beyond `max_message_bytes + 14`, the largest frame
 header plus the configured payload bound.
- Client upgrade responses must include status 101 plus valid `Upgrade`,
 `Connection`, and `Sec-WebSocket-Accept` headers.
