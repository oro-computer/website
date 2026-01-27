# Standard Library Overview (`std::`)

Status: **Design + initial implementation**. The `docs/std/` directory specifies the
intended API and structure. A minimal in-tree stdlib source tree also
exists under `std/` (used by the toolchain to satisfy `import std::...;`).

As of the current compiler/backend subset, the in-tree stdlib includes a
small but functional set of utilities implemented purely in Silk (including
monomorphized, type-parameter generics for core collection types),
plus a tiny hosted POSIX baseline for OS-facing modules (`std::fs`, `std::task`,
`std::sync`, `std::io`) implemented via the `std::runtime` interface layer
(the shipped POSIX runtime backend uses `ext` and therefore requires linking
libc for executable outputs).

The Silk standard library, `std::`, provides foundational functionality built
on top of the language core (regions, buffers, concurrency, etc.). It is intended
to be:

- **Linked by default** for normal builds driven by `silk`.
- **Swappable**: an alternative `std::` implementation can be selected at build
  time, without changing the language or the C ABI.
- **POSIX-first** for OS interactions (initial hosted baseline), while still
  supporting freestanding/embedded builds via a smaller “core” subset.

See also:

- `docs/std/package-structure.md` (namespace + linkage + swappability)
- `docs/std/conventions.md` (API conventions: errors, allocation, ownership)
- `docs/std/result.md` (the standard `Result(T, E)` error return type)

## Core Areas (Initial)

These are the minimum required areas for the initial standard library
distribution:

- `std::buffer` — typed, width-oriented buffer utilities built on top of
  `std::vector` for common scalar element types (see `docs/std/buffer.md`).
- `std::strings` — UTF-8 text utilities and owned string building.
- `std::regex` — regular expression literals and helpers (see `docs/std/regex.md`).
- `std::unicode` — Unicode scalar classification helpers (see `docs/std/unicode.md`).
- `std::number` — number parsing/formatting helpers (see `docs/std/number.md`).
- `std::limits` — numeric min/max limits for primitive types (see `docs/std/limits.md`).
- `std::crypto` — cryptography primitives (hosted baseline via libsodium; see
  `docs/std/crypto.md`).
- `std::uuid` — UUID primitives (v1/v3/v4/v5/v6/v7/v8) with parsing/formatting
  (see `docs/std/uuid.md`).
- `std::semver` — Semantic Versioning (SemVer 2.0.0) parsing and precedence
  comparison (see `docs/std/semver.md`).
- `std::json` — JSON parsing and stringifying (borrowed and owned DOM parsing;
  see `docs/std/json.md`).
- `std::toml` — TOML parsing (borrowed and owned DOM parsing;
  see `docs/std/toml.md`).
- `std::idl::web` — Web IDL parsing and query API (see `docs/std/idl-web.md`).
- `std::js::ecma` — ECMAScript FFI surface for JS/WASM interop (see `docs/std/js-ecma.md`).
- `std::wasm` — WebAssembly runtime API (MVP wasm32 interpreter; see `docs/std/wasm.md`).
- `std::memory` — allocation interfaces and low-level memory utilities.
- `std::arrays` — slice/view types and helpers for fixed arrays.
- `std::bits` — bit manipulation helpers (byte swaps, rotates, bit counts; see
  `docs/std/bits.md`).
- `std::vector` — typed growable vectors (`Vector(T)`), used broadly across
  `std::` (see `docs/std/vector.md`).
- `std::map` — associative containers (hash maps and ordered maps; see
  `docs/std/map.md`).
- `std::set` — set containers (hash sets and ordered sets; see
  `docs/std/set.md`).
- `std::algorithms` — common algorithms over slices/collections.
- `std::temporal` — `Instant`/`Duration` utilities and calendar/time helpers.
- `std::url` — WHATWG URL parsing/serialization and `URLSearchParams` (`application/x-www-form-urlencoded`; see `docs/std/url.md`).
- `std::task` — task/runtime helpers (hosted baseline; see `docs/std/task.md`).
- `std::sync` — synchronization primitives (hosted baseline; see `docs/std/sync.md`).
- `std::args` — native `main(argc, argv)` argument helpers (current subset; see `docs/std/args.md`).
- `std::flag` — command line flag + positional parsing (current subset; see `docs/std/flag.md`).
- `std::test` — test helpers for `silk test` (current subset; see `docs/std/test.md`).
- `std::env` — environment variable access (hosted baseline; see `docs/std/env.md`).
- `std::process` — process primitives (hosted baseline; see `docs/std/process.md`).
- `std::path` — path manipulation utilities (current subset; see `docs/std/path.md`).
- `std::io` — basic I/O (readers/writers, formatting, stdout/stderr).
- `std::fmt` — shared formatting layer used by `std::io` and string builders.
- `std::fs` — filesystem access (POSIX baseline).
- `std::net` — networking primitives (POSIX baseline).
- `std::http` — HTTP/1.1 parsing + blocking client/server on top of `std::net`
  (see `docs/std/http.md`).
- `std::https` — HTTPS (HTTP over TLS) on top of `std::tls` + `std::net`
  (see `docs/std/https.md`).
- `std::websocket` — RFC 6455 WebSocket (handshake + framing) on top of `std::net`
  (see `docs/std/websocket.md`).
- `std::tls` — TLS client/server primitives (POSIX baseline via mbedTLS; see
  `docs/std/tls.md`).
- `std::ssh2` — SSH2 client primitives (POSIX baseline via libssh2; see
  `docs/std/ssh2.md`).
- `std::sqlite` — SQLite database primitives (POSIX baseline via SQLite; see
  `docs/std/sqlite.md`).
- `std::runtime` — runtime interface layer used by OS-facing std modules (see `docs/std/runtime.md`).
- `std::interfaces` — shared std interface contracts (“protocols”) such as
  `Drop`, `Len`, `Capacity`, etc. (see `docs/std/interfaces.md`).
- `std::formal` — reusable Formal Silk theories (“standard lemmas”) used by
  std and downstream verified code (see `docs/std/formal.md`).

Each area has a dedicated design document under `docs/std/` (for intrinsic
surfaces like `std::buffer`, the design lives in both `docs/std/` and the
corresponding language doc). The exact shapes of types and functions will
evolve as the language and backend grow; these docs are the source of truth for
the intended `std::` surface.
