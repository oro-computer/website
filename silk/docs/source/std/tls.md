# `std::tls`

Status: **Implemented subset + design**. `std::tls` provides TLS client/server
primitives for the hosted POSIX baseline using the system `mbedTLS` shared
libraries.

The initial goals are:

- a small but usable `std::tls` session API for clients and servers,
- a transport-agnostic I/O model so TLS can be layered over `std::net::TcpStream`
  or custom runtimes (implemented for `MemPipe` and POSIX file descriptors),
- end-to-end runnable tests that do not depend on real sockets (to keep the
  test suite runnable in sandboxed environments).

## Linkage and Toolchain Integration

On `linux/x86_64` with the glibc dynamic loader (`ld-linux`), `silk build`
automatically adds `libmbedtls.so.14` as a `DT_NEEDED` dependency when a program
imports `mbedtls_*` extern symbols (for example via `import std::tls;`).

Because `libmbedtls.so.14` declares `DT_NEEDED` dependencies on
`libmbedx509.so.1` and `libmbedcrypto.so.7`, downstream users typically do not
need to list those libraries explicitly.

## Implemented API

### Error model

The current `std::tls` API uses `std::result::Result(T, E)` and a stable
`TlsFailed` error value instead of exposing raw mbedTLS error codes.

TLS I/O is transport-driven: when using a non-blocking transport (such as
`MemPipe`), operations may report that they would block and must be retried.
This is surfaced as a `TlsFailed` whose `kind()` is:

- `TlsErrorKind::WouldBlockRead`
- `TlsErrorKind::WouldBlockWrite`

Public error/value types in the current subset:

```silk
module std::tls;

import std::result;

enum TlsErrorKind {
  OutOfMemory,
  InvalidInput,
  BadCertificate,
  BadPrivateKey,
  ConfigFailed,
  SetupFailed,
  WouldBlockRead,
  WouldBlockWrite,
  TlsFailure,
  Unknown,
}

export error TlsFailed {
  code: int,
}

export type TlsIntResult = std::result::Result(int, TlsFailed);
export type SessionResult = std::result::Result(Session, TlsFailed);
```

### `Session`

`Session` is a TLS state machine configured as either a client or a server.

Key operations:

- `Session.client() -> SessionResult` — create a client session with a default
  configuration suitable for tests.
- `Session.server(cert_pem: string, key_pem: string) -> SessionResult` — create
  a server session using PEM-encoded certificate and private key.
- `set_bio_mempipe(bio: u64) -> void` — attach a `MemPipe` endpoint context via
  mbedTLS `ssl_set_bio` using `std::tls::mem_send` and `std::tls::mem_recv`.
- `set_bio_fd(fd: int) -> void` — attach a hosted POSIX file descriptor as the
  underlying stream transport (for example a `std::net::TcpStream` socket).
- `handshake_step() -> TlsIntResult` — advance the handshake state machine by
  one call (returns `Ok(0)` when complete; `Err(...)` on error).
- `read(buf: std::arrays::ByteSlice) -> TlsIntResult` — read decrypted
  application bytes.
- `write(buf: std::arrays::ByteSlice) -> TlsIntResult` — write application
  bytes.
- `write_all(buf: std::arrays::ByteSlice) -> TlsFailed?` — write all
  application bytes (retries internally on `WouldBlockRead` /
  `WouldBlockWrite`).
- `write_string(s: string) -> TlsFailed?` — convenience helper over
  `write_all`.
- `close_notify() -> TlsFailed?` — send a TLS close-notify alert.

`Session` implements `std::interfaces::Drop` and releases all associated mbedTLS
state on drop.

### `MemPipe`

`MemPipe` is an in-memory transport used for tests and for embedding scenarios
where the TLS peer-to-peer byte stream is modeled explicitly.

It provides two endpoint context pointers:

- `client_ctx() -> u64`
- `server_ctx() -> u64`

These pointers can be passed to `Session.set_bio_mempipe(...)`.

## Notes and Limitations (Current Subset)

- The current `std::tls` API is intentionally small; higher-level features
  (hostname verification, CA stores, ALPN, session resumption, etc.) will be
  specified and implemented as the language and stdlib grow.
- The current subset wires `Session` to transports via `MemPipe` and hosted
  POSIX file descriptors (`set_bio_fd`). General user-provided transport
  callbacks are planned but require additional FFI expressiveness beyond the
  current compiler subset.
- The test suite uses `MemPipe` instead of real sockets so it can run in
  environments where `socket(2)` is restricted.
