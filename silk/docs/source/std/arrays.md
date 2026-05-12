# `std::arrays`

A generic `Slice(T)` view type is provided
for early FFI-friendly bridging; higher-level owning containers live in
`std::vector`.

`std::arrays` provides array and vector-like types built on top of the `Buffer(T)`
intrinsic ([buffers](?p=language/buffers)).

See also:

- [memory](?p=std/memory) (allocators)
- [conventions](?p=std/conventions) (allocation and error conventions)

## Exported API

A tiny generic subset is implemented in `std/arrays.slk` to provide a
non-owning, FFI-friendly slice representation for early bridging:

```silk
module std::arrays;

import interfaces from "std/interfaces";

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

Notes:

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
- `get` / `set` are intentionally low-level in the Supported forms and
 are unchecked beyond `#require` contracts. They are implemented using
 compiler-backed memory intrinsics routed through `std::runtime::mem` (see
 [runtime](?p=std/runtime)).
- `Slice(T)` uses the scalar-slot memory model of Silk currently:
 elements occupy `sizeof(T)` bytes (8 bytes per scalar slot), so multi-slot
 values like `string` and non-opaque structs/enums are supported.
 For byte-oriented APIs that require packed bytes, use `ByteSlice`.
- `at` / `try_set` are the “checked” accessors in the Supported forms:
 - `at` returns `None` when `index` is out of bounds,
 - `try_set` returns `false` when `index` is out of bounds.
- `SliceIter(T)` provides a minimal sequential iterator for `Slice(T)` values.
 It implements `std::interfaces::Iterator(T)`; iteration is by value (copies).
- `ByteSlice.find_bytes(empty)` returns `Some(0)` (matches `memmem(3)` semantics).

## `std::interfaces` surface

The shipped `std::arrays` subset already participates in the shared stdlib
protocol story:

- `Slice(T)` implements `std::interfaces::Len` and `std::interfaces::IsEmpty`.
- `ByteSlice` implements `std::interfaces::Len` and `std::interfaces::IsEmpty`.
- `SliceIter(T)` implements `std::interfaces::Iterator(T)`.
- `ByteSliceIter` implements `std::interfaces::Iterator(u8)`.

This matters for two reasons:

- it gives readers a uniform mental model for “view-like” stdlib types,
- and it is the protocol surface used by loops and generic container-style code
 as the compiler grows.

## Scope

`std::arrays` is responsible for:

- Slice/view types over contiguous elements.
- Helpers for fixed-size arrays (`T[N]`) and for working with slices derived
 from them.
- Iteration utilities compatible with the `for` loop semantics (once `for` is
 implemented as specified in [flow for](?p=language/flow-for)).

## Core Types
- `Slice(T)` — a non-owning view over `T` elements (`ptr + len`).
- `std::vector::Vector(T)` — the owning, growable sequence type.
- Fixed-size arrays (`T[N]`) are part of the language design; `std::arrays`
 provides helpers and algorithms that operate on them via `Slice(T)` views.

Illustrative sketch (non-authoritative):

- `std::arrays::Slice(T)` for views, and
- `std::vector::Vector(T)` for owning growth.

## Indexing and Bounds

The stdlib should provide both:

- checked accessors that return `T?` (or a result) on out-of-bounds, and
- unchecked accessors for verified code paths.

The exact behavior must be consistent across the stdlib; see
[conventions](?p=std/conventions).
