# `std::arrays`

Status: **Implemented subset**. A generic `Slice(T)` view type is provided for
FFI-friendly bridging; higher-level owning containers live in `std::vector`.

`std::arrays` provides array and vector-like types built on top of the `Buffer(T)`
intrinsic (`docs/language/buffers.md`).

## Exported API

A tiny generic subset is implemented in `std/arrays.slk` to provide a
non-owning, FFI-friendly slice representation for early bridging:

```silk
module std::arrays;

import std::interfaces;

struct Slice(T) {
  ptr: u64,
  len: i64,
}

impl Slice(T) {
  public fn init (ptr: u64, len: i64) -> Slice(T);
  public fn get (self: &Slice(T), index: i64) -> T;
  public fn set (self: &Slice(T), index: i64, value: T) -> void;
  public fn at (self: &Slice(T), index: i64) -> T?;
  public fn try_set (self: &Slice(T), index: i64, value: T) -> bool;
  public fn first (self: &Slice(T)) -> T?;
  public fn last (self: &Slice(T)) -> T?;
  public fn iter (self: &Slice(T)) -> SliceIter(T);
}

impl Slice(T) as std::interfaces::Len {
  public fn len (self: &Slice(T)) -> i64;
}

impl Slice(T) as std::interfaces::IsEmpty {
  public fn is_empty (self: &Slice(T)) -> bool;
}

struct SliceIter(T) {
  ptr: u64,
  len: i64,
  index: i64,
}

impl SliceIter(T) {
  public fn init (slice: Slice(T)) -> SliceIter(T);
}

impl SliceIter(T) as std::interfaces::Iterator(T) {
  public fn next (mut self: &SliceIter(T)) -> T?;
}

// Packed byte views (for byte-oriented OS/FFI APIs).
struct ByteSlice {
  ptr: u64,
  len: i64,
}

impl ByteSlice {
  public fn init (ptr: u64, len: i64) -> ByteSlice;
  public fn get (self: &ByteSlice, index: i64) -> u8;
  public fn set (self: &ByteSlice, index: i64, value: u8) -> void;
  public fn at (self: &ByteSlice, index: i64) -> u8?;
  public fn try_set (self: &ByteSlice, index: i64, value: u8) -> bool;
  public fn first (self: &ByteSlice) -> u8?;
  public fn last (self: &ByteSlice) -> u8?;
  public fn iter (self: &ByteSlice) -> ByteSliceIter;
  public fn find_u8 (self: &ByteSlice, needle: u8) -> i64?;
  public fn rfind_u8 (self: &ByteSlice, needle: u8) -> i64?;
  public fn find_bytes (self: &ByteSlice, needle: ByteSlice) -> i64?;
}

impl ByteSlice as std::interfaces::Len {
  public fn len (self: &ByteSlice) -> i64;
}

impl ByteSlice as std::interfaces::IsEmpty {
  public fn is_empty (self: &ByteSlice) -> bool;
}

struct ByteSliceIter {
  ptr: u64,
  len: i64,
  index: i64,
}

impl ByteSliceIter {
  public fn init (slice: ByteSlice) -> ByteSliceIter;
}

impl ByteSliceIter as std::interfaces::Iterator(u8) {
  public fn next (mut self: &ByteSliceIter) -> u8?;
}
```

## Examples

### Borrowed typed slices and packed byte slices

```silk
import std::arrays;

fn main () -> int {
  let values: int[3] = [10, 20, 30];
  let slice = std::arrays::Slice(int).init(values as u64, 3);
  if slice.first() != Some(10) {
    return 1;
  }
  if slice.last() != Some(30) {
    return 2;
  }

  let bytes: u8[4] = [1, 2, 3, 4];
  let view = std::arrays::ByteSlice.init(bytes as u64, 4);
  if view.find_u8(3) != Some(2) {
    return 3;
  }

  return 0;
}
```

## Considerations

- `ByteSlice` is the packed-byte view type used for OS/FFI byte APIs. For owning
  packed-byte storage, use `std::buffer::BufferU8`. For owning scalar-slot
  storage, use `std::buffer::Buffer(T)` or `std::vector::Vector(T)` and view it
  as `std::arrays::Slice(T)`.
- In the current API, `ptr` is represented as a raw `u64`
  address for early FFI-friendly bridging. The constructors enforce basic
  invariants via `#require`:
  - `len >= 0`, and
  - `ptr != 0` when `len > 0` (a null pointer is permitted only for empty
    slices).
  In the shipped stdlib sources, these invariants are also packaged as
  reusable theories in `std::formal` (for example `slice_well_formed(ptr, len)`).
- `get` / `set` are intentionally low-level in the current subset and
  are unchecked beyond `#require` contracts. They are implemented using
  compiler-backed memory intrinsics routed through `std::runtime::mem`.
- `Slice(T)` uses the scalar-slot memory model of the current compiler subset:
  elements occupy `sizeof(T)` bytes (8 bytes per scalar slot), so multi-slot
  values like `string` and non-opaque structs/enums are supported.
  For byte-oriented APIs that require packed bytes, use `ByteSlice`.
- `at` / `try_set` are the checked accessors in the current subset:
  - `at` returns `None` when `index` is out of bounds,
  - `try_set` returns `false` when `index` is out of bounds.
- `SliceIter(T)` provides a minimal sequential iterator for `Slice(T)` values.
  It implements `std::interfaces::Iterator(T)`; iteration is by value (copies).
- `ByteSlice.find_bytes(empty)` returns `Some(0)` (matches `memmem(3)` semantics).
- `std::arrays` is the non-owning contiguous-view layer in `std::`. Owning
  growth belongs in `std::vector`, while packed-byte storage belongs in
  `std::buffer::BufferU8`.

## See also

- [`std::buffer`](?p=std/buffer)
- [`std::vector`](?p=std/vector)
- [`std::memory`](?p=std/memory)
- [`std::conventions`](?p=std/conventions)
