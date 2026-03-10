# `std::uuid`

Status: **implemented**. `std::uuid` provides a robust UUID/ULID-like
identifier primitive with full support for UUID versions **1, 3, 4, 5, 6, 7,
and 8** (RFC 4122 + RFC 9562 family).

Goals:

- a small, auditable implementation (no external dependencies required for
  parsing/formatting and name-based UUIDs),
- explicit constructors for each UUID version,
- ergonomic helpers (parse, format, version/variant inspection),
- Formal Silk contracts for buffer and shape preconditions.

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
- `UUID.to_string_lower() -> Result(String, OutOfMemory)` allocates an owned
  string.

## Example: parse + generate + inspect

```silk
import std::uuid;

fn main () -> int {
  let parsed = match std::uuid::parse("6ba7b810-9dad-11d1-80b4-00c04fd430c8") {
    Ok(v) => v,
    Err(_) => return 1,
  };

  let dns = std::uuid::namespace_dns();
  let named = match std::uuid::v5(dns, "www.widgets.com") {
    Ok(v) => v,
    Err(_) => return 2,
  };

  let text = match named.to_string_lower() {
    Ok(v) => v,
    Err(_) => return 3,
  };
  if text.as_string() != "21f7f8de-8051-5b89-8680-0195ef798b6a" {
    return 4;
  }

  if parsed.version() != 1 { return 5; }
  if named.version() != 5 { return 6; }
  if !named.is_rfc4122() { return 7; }
  return 0;
}
```

## Version and Variant

- `UUID.version()` returns the 4-bit version field (0..15).
- `UUID.is_rfc4122()` checks the RFC 4122/RFC 9562 variant (`10xx` in the
  variant field).

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
