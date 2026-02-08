# `std::websocket`

Status: **Implemented (hosted, blocking)**. `std::websocket` provides an RFC 6455
WebSocket implementation on top of `std::net::TcpStream` (client + server
handshake, framing, ping/pong, close, fragmentation).

See also:

- `docs/std/networking.md` (`std::net` sockets)
- RFC 6455: The WebSocket Protocol (wire format + handshake)

## Overview

`std::websocket` is a protocol layer that upgrades an HTTP/1.1 connection to a
WebSocket and then sends/receives WebSocket frames.

Design goals:

- Work for hosted POSIX builds using `std::net`.
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
- TLS (`wss://`) integration (use `std::tls` + a future adapter layer).
- Per-message compression (RSV1 / `permessage-deflate`).

## Public API (Current Compiler Subset)

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

impl WebSocket {
  // Server-side: perform the HTTP upgrade handshake on an accepted TCP stream.
  public fn accept (stream: std::net::TcpStream) -> WebSocketResult;

  // Client-side: connect and perform the HTTP upgrade handshake.
  public fn connect (addr: SocketAddrV4, host: string, path: string) -> WebSocketResult;

  public fn is_valid (self: &WebSocket) -> bool;
  public fn close (mut self: &WebSocket) -> ProtocolError?;

  // Read the next complete application message (text or binary).
  // Ping frames are answered automatically and do not surface as messages.
  public fn read_message (mut self: &WebSocket) -> MessageResult;

  // Send a single unfragmented message.
  public fn write_text (self: &WebSocket, text: string) -> ProtocolError?;
  public fn write_bytes (self: &WebSocket, bytes: std::arrays::ByteSlice) -> ProtocolError?;
}

struct WebSocketServer {
  // opaque handle
}

impl WebSocketServer {
  public fn listen (addr: SocketAddrV4, backlog: int) -> WebSocketServerResult;
  public fn is_valid (self: &WebSocketServer) -> bool;
  public fn local_port (self: &WebSocketServer) -> std::net::NetIntResult;
  public fn accept (mut self: &WebSocketServer) -> WebSocketResult;
  public fn close (mut self: &WebSocketServer) -> HandshakeError?;
}
```

Notes:

- This API is currently **blocking**.
- Handle types wrap OS resources; avoid copying `WebSocket` / `WebSocketServer`
  values until the language has move-only handles.

## Protocol Rules Enforced

The implementation enforces the following RFC 6455 requirements:

- Client→server frames **must** be masked; server→client frames **must not** be masked.
- Reserved bits (RSV1/2/3) must be zero (compression/extensions are not supported).
- Control frames (ping/pong/close):
  - are not allowed to be fragmented (`FIN = 1`),
  - must have payload length ≤ 125.
- Close frames trigger an attempted close reply and then the connection is
  treated as closed from the API’s perspective.
