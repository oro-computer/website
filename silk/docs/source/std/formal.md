# `std::formal`

Status: **Implemented reusable theory set**. This module provides named Formal
Silk theories that stdlib code and downstream code can attach with `#theory`
instead of repeating low-level `#require` clauses.

These theories serve two goals:

- make common proof obligations readable and consistent across `std::`,
- and give downstream code a small, stable vocabulary for Z3-backed
  verification.

See `docs/language/formal-verification.md` for the Formal Silk execution model
and theory semantics.

## Exported API

### Scalar and arithmetic

- `nonnegative_i64(x: i64)` — `x >= 0`
- `positive_i64(x: i64)` — `x > 0`
- `nonnull_u64(ptr: u64)` — `ptr != 0`
- `bounds_i64(index: i64, len: i64)` — `0 <= index < len`
- `bounds_inclusive_i64(value: i64, max_inclusive: i64)` — `0 <= value <= max_inclusive`
- `range_i64(value: i64, lo: i64, hi: i64)` — `lo <= value < hi`
- `range_inclusive_i64(value: i64, lo: i64, hi: i64)` — `lo <= value <= hi`
- `add_nonnegative_no_overflow_i64(a: i64, b: i64)` — non-negative addition without signed overflow
- `power_of_two_u64(value: u64)` — `value` is a non-zero power of two
- `aligned_u64(value: u64, alignment: u64)` — `value % alignment == 0`

### Slice, vector, and owned-string storage

- `slice_well_formed(ptr: u64, len: i64)` — `len >= 0` and non-empty slices have a non-null pointer
- `slice_nonempty(ptr: u64, len: i64)` — `len > 0` and `ptr != 0`
- `slice_has_at_least(ptr: u64, len: i64, needed: i64)` — a well-formed slice with `len >= needed`
- `slice_index_i64(ptr: u64, len: i64, index: i64)` — a well-formed slice plus an in-bounds index
- `slice_range_i64(start: i64, end: i64, len: i64)` — `0 <= start <= end <= len`
- `buffer_well_formed(ptr: u64, cap: i64)` — `cap >= 0` and non-zero capacity implies non-null storage
- `vector_well_formed(ptr: u64, len: i64, cap: i64)` — `0 <= len <= cap` and non-zero capacity implies non-null storage
- `cap_at_least_len_plus_i64(cap: i64, len: i64, additional: i64)` — capacity is large enough for `len + additional`
- `vector_has_space_i64(ptr: u64, len: i64, cap: i64, additional: i64)` — a well-formed vector with spare room
- `vector_index_i64(ptr: u64, len: i64, cap: i64, index: i64)` — a well-formed vector plus an in-bounds index
- `string_storage_well_formed(ptr: u64, len: i64, cap: i64)` — the canonical owned-string/path invariant used by `std::strings::String`, `std::path::PathBuf`, and `std::url::URLSearchParams`
- `parallel_slot_tables_well_formed(...)` — seven length-locked slot tables that each satisfy `vector_well_formed`
- `index_dom_storage_well_formed(...)` — the shared index-DOM storage invariant used by `std::json::Document` and `std::toml::Document`

`string_storage_well_formed` is intentionally stricter than
`vector_well_formed`:

- it permits the zero-capacity empty state `{ ptr: 0, len: 0, cap: 0 }`,
- and for allocated storage it requires `cap > len`, leaving one trailing byte
  available for the terminating NUL at `ptr[len]`.

`index_dom_storage_well_formed` captures the parallel-table DOM layout used by
the current structured-text stdlib:

- the core node tables (`tags`, payload tables, sibling links, and string
  metadata tables) must all have the same logical length,
- each table must independently satisfy `vector_well_formed`,
- and the tracked owned-allocation table is well-formed but intentionally does
  not need to match the node-table length.

### UUID layout

- `uuid_nil_words(hi: u64, lo: u64)` — the all-zero UUID representation
- `uuid_version_field_is(hi: u64, version: u64)` — the version nibble stored in byte 6 matches `version`
- `uuid_rfc4122_variant(lo: u64)` — the variant bits encode the RFC 4122 / RFC 9562 `10xx` layout
- `uuid_rfc4122_version_is(hi: u64, lo: u64, version: u64)` — a UUID has both the requested version nibble and the RFC 4122 / RFC 9562 variant bits

These theories are the shared vocabulary behind the trusted total-constructor
surface in `std::uuid`:

- `UUID.nil()` proves `uuid_nil_words(...)`,
- `std::uuid::{namespace_dns,namespace_url,namespace_oid,namespace_x500}` prove
  `uuid_rfc4122_version_is(..., 1)`,
- `std::uuid::v4_from_u64s` proves `uuid_rfc4122_version_is(..., 4)`,
- and `std::uuid::v8_from_u64s` proves `uuid_rfc4122_version_is(..., 8)`.

That gives downstream verified code a stable way to rely on UUID layout facts
without re-encoding the raw bit arithmetic locally.

### Build configuration

- `build_kind_is(kind: string)`
- `build_mode_is(mode: string)`
- `requires_test_mode()`
- `requires_debug_mode()`
- `requires_release_mode()`
- `requires_executable_kind()`
- `requires_object_kind()`
- `requires_static_kind()`
- `requires_shared_kind()`

These theories let library code or build modules express build-mode and
artifact-kind assumptions against the compiler-provided `BUILD_*` constants.

### SemVer core comparisons

- `semver_core_eq(a_major, a_minor, a_patch, b_major, b_minor, b_patch)`
- `semver_core_ge(a_major, a_minor, a_patch, b_major, b_minor, b_patch)`
- `semver_core_gt(a_major, a_minor, a_patch, b_major, b_minor, b_patch)`
- `semver_core_lt(a_major, a_minor, a_patch, b_major, b_minor, b_patch)`
- `semver_core_le(a_major, a_minor, a_patch, b_major, b_minor, b_patch)`
- `build_version_at_least(major: u64, minor: u64, patch: u64)`

These model only the SemVer core triplet. They are suitable for version gating
and ordering proofs that do not depend on prerelease/build precedence rules.
`std::semver::Version.cmp` now also carries direct Formal Silk postconditions
for compare-result range and core-triplet sign implications, so downstream code
can combine the reusable `std::formal` theories with the shipped runtime API
instead of restating those facts manually.

## Examples

```silk
import { bounds_i64, string_storage_well_formed } from "std/formal";

struct View {
  ptr: u64,
  len: i64,
  cap: i64,
}

impl View {
  #theory string_storage_well_formed(self.ptr, self.len, self.cap);
  fn as_string (self: &View) -> string {
    return self.ptr as string(self.len);
  }

  #theory bounds_i64(index, self.len);
  fn get_byte (self: &View, index: i64) -> u8 {
    return std::runtime::mem::load_u8(self.ptr, index);
  }
}
```
