# `std::tls`

`std::tls` provides TLS client/server
primitives for the hosted POSIX baseline using vendored `mbedTLS` static
archives.

The initial goals are:

- a small but usable `std::tls` session API for clients and servers,
- a transport-agnostic I/O model so TLS can be layered over `std::net::TCPStream`
 or custom runtimes (implemented for `MemPipe` and POSIX file descriptors),
- end-to-end runnable tests that do not depend on real sockets (to keep the
 test suite runnable in sandboxed environments).

## Linkage and Toolchain Integration

On `linux/x86_64`, `silk build` auto-links the vendored mbedTLS static archives
(`libmbedtls.a`, `libmbedx509.a`, `libmbedcrypto.a`) from:

- the repo checkout: `vendor/lib/<host-layout>/`, or
- an installed prefix: `<prefix>/lib/silk/vendor/lib/<host-layout>/`.

This avoids a runtime `DT_NEEDED` dependency on system mbedTLS shared libraries.
When the vendored archives are missing, `silk build` reports an error that
instructs the user to run `zig build deps`.

The vendored mbedTLS in the Silk compiler repository is pinned (currently **Mbed TLS 4.0.0**).
In mbedTLS 4.x, TLS depends on the PSA crypto subsystem for randomness and
cryptographic operations.

`Session` constructors call `psa_crypto_init()` and then rely on
`mbedtls_ssl_config_defaults(...)` + `mbedtls_ssl_setup(...)` without explicitly
configuring a legacy `f_rng` callback (the historical `mbedtls_ssl_conf_rng(...)`
API is not present in mbedTLS 4.x).

## Exported API
### Error model

The current `std::tls` API uses `Result(T, E)` and a stable
`TLSFailed` error value instead of exposing raw mbedTLS error codes.

TLS I/O is transport-driven: when using a non-blocking transport (such as
`MemPipe`), operations may report that they would block and must be retried.
This is surfaced as a `TLSFailed` whose `kind()` is:

- `TLSErrorKind::WouldBlockRead`
- `TLSErrorKind::WouldBlockWrite`

On TLS 1.3 connections, servers may send post-handshake `NewSessionTicket`
messages. mbedTLS reports these via `MBEDTLS_ERR_SSL_RECEIVED_NEW_SESSION_TICKET`.
`std::tls` treats this as a retryable read condition (surfaced as
`TLSErrorKind::WouldBlockRead`) so higher-level callers can continue reading
application bytes.

Public error/value types in the Supported forms:

```silk
module std::tls;
enum TLSErrorKind {
  OutOfMemory,
  InvalidInput,
  BadCertificate,
  BadPrivateKey,
  ConfigFailed,
  SetupFailed,
  WouldBlockRead,
  WouldBlockWrite,
  TLSFailure,
  Unknown,
}

export error TLSFailed {
  code: int,
}

export type TLSIntResult = Result(int, TLSFailed);
export type SessionResult = Result(Session, TLSFailed);
```

### `Session`

`Session` is a TLS state machine configured as either a client or a server.

Key operations:

- `Session.client() -> SessionResult` — create a client session with a default
 configuration suitable for tests.
- `Session.client_verified_system() -> SessionResult` — create a client session
 configured to verify peer certificates using a system CA bundle.
- `Session.client_verified_ca_pem(ca_pem: string) -> SessionResult` — create a
 client session configured to verify peer certificates using a caller-provided
 PEM bundle.
- `Session.server(cert_pem: string, key_pem: string) -> SessionResult` — create
 a server session using PEM-encoded certificate and private key.
- `set_bio_mempipe(bio: u64) -> void` — attach a `MemPipe` endpoint context via
 mbedTLS `ssl_set_bio` using `std::tls::mem_send` and `std::tls::mem_recv`.
- `set_bio_fd(fd: int) -> void` — attach a hosted POSIX file descriptor as the
 underlying stream transport (for example a `std::net::TCPStream` socket).
- `set_hostname(hostname: string) -> TLSFailed?` — set the TLS hostname (SNI)
 and enable hostname verification for verified client sessions.
- `handshake_step() -> TLSIntResult` — advance the handshake state machine by
 one call (returns `Ok(0)` when complete; `Err(...)` on error).
- `read(buf: std::arrays::ByteSlice) -> TLSIntResult` — read decrypted
 application bytes.
- `write(buf: std::arrays::ByteSlice) -> TLSIntResult` — write application
 bytes.
- `write_all(buf: std::arrays::ByteSlice) -> TLSFailed?` — write all
 application bytes (retries internally on `WouldBlockRead` /
 `WouldBlockWrite`).
- `write_string(s: string) -> TLSFailed?` — convenience helper over
 `write_all`.
- `close_notify() -> TLSFailed?` — send a TLS close-notify alert.

`Session` implements `std::interfaces::Drop` and releases all associated mbedTLS
state on drop.

### `MemPipe`

`MemPipe` is an in-memory transport used for tests and for embedding scenarios
where the TLS peer-to-peer byte stream is modeled explicitly.

It provides two endpoint context pointers:

- `client_ctx() -> u64`
- `server_ctx() -> u64`

These pointers can be passed to `Session.set_bio_mempipe(...)`.

## Considerations

- The current `std::tls` API is intentionally small; higher-level features
 (hostname verification, CA stores, ALPN, session resumption, etc.) will be
 specified and implemented as the language and stdlib grow.
- The Supported forms wires `Session` to transports via `MemPipe` and hosted
 POSIX file descriptors (`set_bio_fd`). General user-provided transport
 callbacks are planned but require additional FFI expressiveness beyond the
 current implementation.
- The initial tests use `MemPipe` instead of real sockets so `make test` can run
 in environments where `socket(2)` is restricted.
