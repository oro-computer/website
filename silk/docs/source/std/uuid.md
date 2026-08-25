# `std::uuid`

`std::uuid` provides a robust UUID/ULID-like
identifier primitive with full support for UUID versions **1, 3, 4, 5, 6, 7,
and 8** (RFC 4122 + RFC 9562 family).

Goals:

- a small, auditable implementation (no external dependencies required for
 parsing/formatting and name-based UUIDs),
- explicit constructors for each UUID version,
- ergonomic helpers (parse, format, version/variant inspection),
- Formal Silk contracts for version/variant layout and buffer/shape
 preconditions.

## Representation

`UUID` is represented as two `u64` words:

- `hi`: the first 8 bytes (bytes 0..7) in network order,
- `lo`: the last 8 bytes (bytes 8..15) in network order.

This matches the canonical string form:

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

where the leftmost hex pairs correspond to lower byte indices.

## Parsing and Formatting

The current API supports:

- parsing:
 - canonical hyphenated form (`8-4-4-4-12` hex digits),
 - optional surrounding braces (`{...}`),
 - optional `urn:uuid:` prefix,
- formatting:
 - canonical hyphenated lowercase string form.

API notes:

- `std::uuid::parse(s: string) -> std::uuid::ParseResult` returns
 `Ok(UUID)` on success, otherwise `Err(ParseError)`.
 - `ParseError.kind()` reports a stable error kind.
 - `ParseError.offset` reports the byte offset into the original input string.
- `UUID.parse(s: string) -> std::uuid::ParseResult` is the standardized
 receiverless parse form via `std::interfaces::Parse(ParseError)`.
- `UUID.try_serialize() -> Result(String, OutOfMemory)` is the standardized
 fallible owned-string rendering path via
 `std::interfaces::TrySerialize(std::memory::OutOfMemory)`.
- `UUID.to_string_lower() -> Result(String, OutOfMemory)` allocates an owned
 lowercase canonical string and returns the same output as `try_serialize()`.

Example:

```silk
import std::uuid;

fn main () -> int {
  match (std::uuid::UUID.parse("550e8400-e29b-41d4-a716-446655440000")) {
    Ok(id) => {
      if !id.is_rfc4122() { return 2; }
      return 0;
    },
    Err(_) => { return 1; },
  }
}
```

## Version and Variant

- `UUID.version()` returns the 4-bit version field (0..15).
- `UUID.is_rfc4122()` checks the RFC 4122/RFC 9562 variant (`10xx` in the
 variant field).
- `UUID.nil()` and `UUID.is_nil()` expose the all-zero UUID shape directly.

Formal Silk surface:

- `UUID.from_u64s(hi, lo)` guarantees the stored words are exactly `hi` and
 `lo`.
- `UUID.nil()` proves the reusable `std::uuid::uuid_nil_words(...)` theory.
- `UUID.version()` carries the explicit postcondition range `0 <= result <= 15`.
- `UUID.is_nil()` proves that `true` implies both words are zero, and the
 all-zero word pattern implies `true`.
- `UUID.is_rfc4122()` proves that `true` implies the RFC 4122 / RFC 9562
 variant bits are present, and that exact variant-bit pattern implies `true`.
- `std::uuid::{namespace_dns,namespace_url,namespace_oid,namespace_x500}` prove
 `std::uuid::uuid_rfc4122_version_is(..., 1)`.
- `std::uuid::v4_from_u64s` proves
 `std::uuid::uuid_rfc4122_version_is(..., 4)`.
- `std::uuid::v8_from_u64s` proves
 `std::uuid::uuid_rfc4122_version_is(..., 8)`.
- The module also exports the lower-level reusable layout theories
 `uuid_version_field_is(...)` and `uuid_rfc4122_variant(...)` for downstream
 code that needs to reason about those bitfields separately.

Current verifier boundary:

- The current Formal Silk subset does not yet express “on `Ok(UUID)`” style
 success-side postconditions for `Result(UUID, E)` constructors cleanly.
- Verified blocks still only support primitive/string-like symbolic local
 bindings, so a downstream proof cannot yet bind a `UUID` local and then
 inspect its fields directly inside Formal Silk.
- So `std::uuid::{v1,v3,v5,v6,v7}` are still fully implemented and tested, but
 their version/variant guarantees are currently documented and regression
 tested rather than exposed as first-class success-side contracts.

## Supported Versions

The std surface provides constructors for:

- **v1**: time-based (Gregorian epoch, 100ns ticks) with `{ timestamp_100ns,
 clock_seq, node }` inputs.
- **v3**: name-based (MD5 over `namespace || name`).
- **v4**: random-based (122 random bits + version/variant bits).
- **v5**: name-based (SHA-1 over `namespace || name`).
- **v6**: reordered time-based (same inputs as v1; timestamp bits reordered for
 lexical sorting).
- **v7**: Unix-epoch time-based (48-bit milliseconds + 74 random bits).
- **v8**: custom (caller-provided 128-bit value with version/variant applied).

Fallibility:

- `std::uuid::{v1,v3,v5,v6,v7}` return `std::uuid::UUIDResult` (`Result(UUID, UUIDFailed)`).
- `std::uuid::timestamp_100ns_from_unix_ns` returns `Result(u64, UUIDFailed)` and
 may fail with `Overflow`.
- `std::uuid::random::*` returns `std::uuid::UUIDResult` and may fail due to
 `InitFailed` (libsodium) or `NoTime` (missing clock).

`std::uuid::random` also provides `v1_now` / `v6_now` / `v7_now` using
`std::runtime::time::unix_now_ns` / `unix_now_ms` so callers can generate UUIDs
without passing explicit timestamps.

Planned follow-ups:

- richer formatting options (uppercase, simple hex, braced form, URN form),
- UUIDv2 (DCE Security) if/when `std::process` exposes stable UID/GID APIs.
