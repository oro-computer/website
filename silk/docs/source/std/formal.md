# `std::formal`

This module provides the
small, stable Formal Silk vocabulary that is broadly reusable across `std::`
and downstream verified code.

`std::formal` is intentionally about **base facts**, not every theory the
stdlib happens to use internally. The rule is:

- keep generic arithmetic, range, pointer, slice, buffer, and vector theories
  here,
- move module-owned theories to the module that owns that runtime surface,
- and keep purely local implementation-detail theories private when they are
  not useful as downstream vocabulary.

This keeps verification concepts discoverable in the same place readers find
the API they describe.

See `docs/language/formal-verification.md` for the Formal Silk execution model
and theory semantics.

## Importing and using foundational theories

```silk
import { bounds_i64, vector_well_formed } from "std/formal";

struct I64VecView {
  ptr: u64,
  len: i64,
  cap: i64,
}

impl I64VecView {
  #theory vector_well_formed(self.ptr, self.len, self.cap);
  fn len_ok (self: &I64VecView) -> bool {
    return self.len <= self.cap;
  }

  #theory vector_well_formed(self.ptr, self.len, self.cap);
  #theory bounds_i64(index, self.len);
  fn get_raw (self: &I64VecView, index: i64) -> i64 {
    return std::runtime::mem::load_u64(self.ptr, index * 8) as raw i64;
  }
}
```

## What lives outside `std::formal`

Module-owned theories now live with their owning modules:

- `std::strings::string_storage_well_formed(...)`
  - canonical owned-string / path-buffer / search-params storage invariant
- `std::semver::{semver_core_eq,semver_core_ge,semver_core_gt,semver_core_lt,semver_core_le}`
  - reusable SemVer core-triplet ordering vocabulary
- `std::uuid::{uuid_nil_words,uuid_version_field_is,uuid_rfc4122_variant,uuid_rfc4122_version_is}`
  - UUID layout vocabulary
- `std::runtime::build::{build_kind_is,build_mode_is,requires_debug_mode,requires_release_mode,requires_executable_kind,requires_object_kind,requires_static_kind,requires_shared_kind,build_version_at_least}`
  - build-metadata verification vocabulary
- `std::test::requires_test_mode()`
  - test-only helper contract surface
- `std::json` / `std::toml`
  - DOM-storage theories stay local because they describe module-internal table
    layouts rather than stable public abstractions

## Theory families

### Scalar and arithmetic

- `nonnegative_i64(x: i64)`
  - requires `x >= 0`
  - use for lengths, counts, capacities, and offsets
- `positive_i64(x: i64)`
  - requires `x > 0`
  - use when zero must be excluded
- `nonnull_u64(ptr: u64)`
  - requires `ptr != 0`
  - use for pointer-like integers that must name storage
- `bounds_i64(index: i64, len: i64)`
  - requires `0 <= index < len`
  - use for zero-based indexing into initialized sequence elements
- `bounds_inclusive_i64(value: i64, max_inclusive: i64)`
  - requires `0 <= value <= max_inclusive`
  - use for inclusive upper-bound facts such as nibble or flag ranges
- `range_i64(value: i64, lo: i64, hi: i64)`
  - requires `lo <= value < hi`
  - use for generic half-open interval facts
- `range_inclusive_i64(value: i64, lo: i64, hi: i64)`
  - requires `lo <= value <= hi`
  - use for generic inclusive interval facts
- `add_nonnegative_no_overflow_i64(a: i64, b: i64)`
  - requires non-negative operands and proves `a + b` cannot signed-overflow
  - use before growth arithmetic or `len + additional` style calculations
- `power_of_two_u64(value: u64)`
  - requires `value` to be a non-zero power of two
  - use for alignment, mask, and table-size reasoning
- `aligned_u64(value: u64, alignment: u64)`
  - requires `value % alignment == 0`
  - use for address or byte-offset alignment facts

### Slice, buffer, and vector storage

- `slice_well_formed(ptr: u64, len: i64)`
  - requires `len >= 0`
  - requires non-null storage when `len > 0`
  - use for borrowed pointer/length pairs
- `slice_nonempty(ptr: u64, len: i64)`
  - requires `len > 0` and `ptr != 0`
  - use when an empty slice is not allowed
- `slice_has_at_least(ptr: u64, len: i64, needed: i64)`
  - combines `slice_well_formed` with `len >= needed`
  - use before fixed-width reads or multi-byte decoding
- `slice_index_i64(ptr: u64, len: i64, index: i64)`
  - combines `slice_well_formed` with an in-bounds index
  - use before element loads
- `slice_range_i64(start: i64, end: i64, len: i64)`
  - requires `0 <= start <= end <= len`
  - use before sub-slicing or span copying
- `buffer_well_formed(ptr: u64, cap: i64)`
  - requires `cap >= 0`
  - requires non-null storage when `cap > 0`
  - use for capacity-only storage handles
- `vector_well_formed(ptr: u64, len: i64, cap: i64)`
  - requires `0 <= len <= cap`
  - requires non-null storage when `cap > 0`
  - use for initialized-prefix dynamic storage
- `cap_at_least_len_plus_i64(cap: i64, len: i64, additional: i64)`
  - proves that capacity is large enough for `len + additional`
  - use before append/grow operations
- `vector_has_space_i64(ptr: u64, len: i64, cap: i64, additional: i64)`
  - combines `vector_well_formed` and spare-capacity facts
  - use before writes that extend the initialized prefix
- `vector_index_i64(ptr: u64, len: i64, cap: i64, index: i64)`
  - combines `vector_well_formed` with an in-bounds initialized index
  - use before reads from the live prefix of vector storage
