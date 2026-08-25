# `std::crypto`

`std::crypto` provides
cryptographic primitives through a selectable security provider. The `builtin`
provider uses target-matched built-in `libsodium` archives on the hosted POSIX
baseline; the Apple `platform` provider uses Security-backed runtime helpers
for the currently wired core/random subset.

The long-term goal is:

- a cohesive, ergonomic `std::crypto` API surface that is suitable for Silk
 programs,
- a thin, auditable mapping to platform or libsodium primitives (no bespoke
 crypto),
- pervasive use of Formal Silk contracts/theories to document and verify:
 - buffer shape invariants (`len >= 0`, non-null when non-empty),
 - constant-size requirements (keys/nonces/MAC sizes),
 - “no aliasing required” rules where relevant.

Security note:

- Formal Silk can help specify *shape* invariants and prevent a large class of
 memory/length bugs, but it does **not** prove cryptographic security.

## Provider and Linkage Integration

Provider selection is shared by `silk build`, `silk check`, and `silk test`:

- `auto` selects platform-backed APIs first on Apple targets and falls back to
 built-in archives for std APIs that do not yet have an Apple platform mapping;
 it selects the built-in provider elsewhere,
- `platform` is valid only for Apple targets and is strict: it rejects APIs that
 still need the built-in libsodium/mbedTLS/libssh2 fallback,
- `builtin` uses the toolchain-built libsodium archive.

Override sources are, in priority order: `--security-provider`, then
`SILK_SECURITY_PROVIDER`, then `[build] security_provider`, then `auto`.

On Apple targets with the `auto` or `platform` provider, `std::crypto::init`,
`std::crypto::memzero`, `std::crypto::equal`, and `std::crypto::random` route
through bundled runtime helpers backed by the Security framework. Builds that
use those helpers link `Security.framework`.

With the `builtin` provider on supported hosted target layouts, `silk build`
auto-links the built-in `libsodium.a` archive from:

- the repo checkout: `vendor/lib/<target-layout>/`, or
- an installed prefix: `<prefix>/lib/silk/vendor/lib/<target-layout>/`.

The current target layouts are `x64-linux` for glibc Linux x86_64,
`x64-linux-musl` for musl Linux x86_64, and `aarch64-macos` for Apple Silicon
macOS.

This avoids a runtime `DT_NEEDED` dependency on a system `libsodium` shared
library. When the built-in archive is missing, `silk build` reports an error
that instructs the user to run `zig build deps` for the selected target.

In `auto` mode on Apple targets, the advanced nested modules
(`std::crypto::hash`, `std::crypto::aead`, `std::crypto::secretbox`,
`std::crypto::box`, and `std::crypto::sign`) fall back to the built-in
libsodium archive while shared `std::crypto` core/random helpers still use
Security where they are referenced. Fallback module operations initialize the
built-in libsodium provider before calling libsodium primitives. Explicit
`platform` builds reject those advanced modules until Apple platform mappings
for the higher-level primitives are specified and implemented.

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

## Exported API

The initial `std::crypto` module is organized as:

- `std::crypto` (core helpers and provider init)
- `std::crypto::random` (CSPRNG; Security on Apple platform, libsodium on
 builtin)
- `std::crypto::hash` (variable-length BLAKE2b, keyed BLAKE2b, and fixed
 32-byte SHA-256 hashing)
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

### Hashing (`std::crypto::hash`)

The hash module exposes `blake2b`, `blake2b_keyed`, and `sha256`. Each accepts
an owning mutable `BufferU8` output plus checked byte-slice input, initializes
libsodium, grows the output as required, and returns `CryptoError?`. SHA-256 has
a fixed 32-byte output and is suitable for interoperable protocols that
specifically require SHA-256; it is not substituted with BLAKE2b.

See [crypto hash](?p=std/crypto-hash) for exact signatures and
output ownership.

### AEAD (`std::crypto::aead`)

The current AEAD surface provides two constructions:

- **ChaCha20-Poly1305 (IETF)** — `chacha20poly1305_ietf_*`
- **XChaCha20-Poly1305 (IETF)** — `xchacha20poly1305_ietf_*`

For each construction:

- size queries: `*_key_bytes()`, `*_nonce_bytes()`, `*_tag_bytes()` (each returns `i64`)
- sealing: `*_seal(mut c: &std::buffer::BufferU8, m: std::arrays::ByteSlice, ad: std::arrays::ByteSlice, nonce: std::arrays::ByteSlice, key: std::arrays::ByteSlice) -> std::crypto::CryptoError?`
 - returns `None` on success, otherwise `Some(CryptoError)`
 - sets `c.len = ciphertext_len` on success
 - requires extra capacity (`ciphertext_len + 8`) for libsodium’s `clen_p` out-parameter scratch in the Supported forms
- opening: `*_open(mut m: &std::buffer::BufferU8, c: std::arrays::ByteSlice, ad: std::arrays::ByteSlice, nonce: std::arrays::ByteSlice, key: std::arrays::ByteSlice) -> std::crypto::CryptoError?`
 - returns `None` on success, otherwise `Some(CryptoError)`
 - sets `m.len = message_len` on success
 - requires extra capacity (`message_len + 8`) for libsodium’s `mlen_p` out-parameter scratch in the Supported forms

Associated data is optional: callers may pass `ad = { ptr: 0, len: 0 }`.

Planned expansion:

- key derivation (`kdf`, `pwhash`),
- streaming (`secretstream`),
- constant-time and secure-memory helpers (`mprotect`, `mlock`, guarded alloc),
- full libsodium surface coverage where it makes sense for `std::`.
