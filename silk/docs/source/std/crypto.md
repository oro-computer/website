# `std::crypto`

Status: **Initial implementation + design**. `std::crypto` provides cryptographic
primitives backed by the system `libsodium` library on the hosted
`linux/x86_64` baseline.

The long-term goal is:

- a cohesive, ergonomic `std::crypto` API surface that is suitable for Silk
  programs,
- a thin, auditable mapping to libsodium primitives (no bespoke crypto),
- pervasive use of Formal Silk contracts/theories to document and verify:
  - buffer shape invariants (`len >= 0`, non-null when non-empty),
  - constant-size requirements (keys/nonces/MAC sizes),
  - “no aliasing required” rules where relevant.

Security note:

- Formal Silk can help specify *shape* invariants and prevent a large class of
  memory/length bugs, but it does **not** prove cryptographic security.

## Linkage and Toolchain Integration

On `linux/x86_64` with the glibc dynamic loader (`ld-linux`), `silk build`
automatically adds `libsodium.so.23` as a `DT_NEEDED` dependency when a program
imports libsodium-backed extern symbols (for example via `import std::crypto;`).

This mirrors the existing behavior for `libc.so.6` so downstream users do not
have to pass `--needed libsodium.so.23` for normal hosted builds.

## Byte Buffers

The current `std::vector`/`std::buffer` element model stores each
generic element in an 8-byte slot (even for `u8`), so `std::vector::Vector(u8)`
is not a packed byte array suitable for OS/FFI byte-oriented APIs.

For byte-oriented APIs, the stdlib provides packed byte types:

- `std::arrays::ByteSlice` — a non-owning `{ ptr, len }` view over packed bytes
  (`len` in bytes).
- `std::buffer::BufferU8` — an owning `{ ptr, cap, len }` packed byte buffer
  (`cap`/`len` in bytes).

`std::crypto` expresses byte-oriented inputs and outputs in terms of these
types (instead of exposing raw `(ptr, len)` pairs directly in public APIs).

The underlying raw allocation and load/store operations are provided by
`std::runtime::mem`.

## Current API (Initial)

The initial `std::crypto` module is organized as:

- `std::crypto` (core helpers and libsodium init)
- `std::crypto::random` (CSPRNG)
- `std::crypto::hash` (generic hashing)
- `std::crypto::aead` (AEAD: ChaCha20-Poly1305 IETF and XChaCha20-Poly1305 IETF)
- `std::crypto::secretbox` (secret-key authenticated encryption)
- `std::crypto::box` (public-key authenticated encryption)
- `std::crypto::sign` (signatures)

Key design rules:

- public APIs avoid `sodium_` prefixes; libsodium symbol names remain in private
  `ext` declarations,
- APIs accept explicit output buffers (typically `mut out: &std::buffer::BufferU8`),
  and may grow those buffers via `reserve_additional` when needed,
- where libsodium requires out-parameters and the current language subset cannot
  take the address of a stack scalar, APIs may require caller-provided scratch
  bytes (for example by requiring extra capacity in a `BufferU8` beyond the
  returned `len`),
- functions return recoverable error values:
  - `ErrorType?` where `None` is success,
  - `std::result::Result(T, ErrorType)` where `Ok(T)` is success and `Err(ErrorType)` is failure
    (use `Result(bool, ErrorType)` for fallible predicates).

### AEAD (`std::crypto::aead`)

The current AEAD surface provides two constructions:

- **ChaCha20-Poly1305 (IETF)** — `chacha20poly1305_ietf_*`
- **XChaCha20-Poly1305 (IETF)** — `xchacha20poly1305_ietf_*`

For each construction:

- size queries: `*_key_bytes()`, `*_nonce_bytes()`, `*_tag_bytes()` (each returns `i64`)
- sealing: `*_seal(mut c: &std::buffer::BufferU8, m: std::arrays::ByteSlice, ad: std::arrays::ByteSlice, nonce: std::arrays::ByteSlice, key: std::arrays::ByteSlice) -> std::crypto::CryptoError?`
  - returns `None` on success, otherwise `Some(CryptoError)`
  - sets `c.len = ciphertext_len` on success
  - requires extra capacity (`ciphertext_len + 8`) for libsodium’s `clen_p` out-parameter scratch in the current subset
- opening: `*_open(mut m: &std::buffer::BufferU8, c: std::arrays::ByteSlice, ad: std::arrays::ByteSlice, nonce: std::arrays::ByteSlice, key: std::arrays::ByteSlice) -> std::crypto::CryptoError?`
  - returns `None` on success, otherwise `Some(CryptoError)`
  - sets `m.len = message_len` on success
  - requires extra capacity (`message_len + 8`) for libsodium’s `mlen_p` out-parameter scratch in the current subset

Associated data is optional: callers may pass `ad = { ptr: 0, len: 0 }`.

Planned expansion (tracked in `PLAN.md`):

- key derivation (`kdf`, `pwhash`),
- streaming (`secretstream`),
- constant-time and secure-memory helpers (`mprotect`, `mlock`, guarded alloc),
- full libsodium surface coverage where it makes sense for `std::`.
