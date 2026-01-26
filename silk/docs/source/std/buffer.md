# `std::buffer`

Status: **Initial implementation + design**. In the long-term design, Silk exposes an
intrinsic `Buffer(T)` type for low-level, unsafe contiguous memory access (see
`docs/language/buffers.md`).

In the current stdlib, `std::buffer` provides a packed byte
buffer (`BufferU8`) plus width-oriented buffer aliases built on
`std::vector::Vector(T)` for common scalar element types. This keeps buffer
usage ergonomic without relying on per-type `Vec*` stand-ins.

See also:

- `docs/std/vector.md` (`Vector(T)`)
- `docs/language/buffers.md` (intrinsic `Buffer(T)` design)
- `docs/std/io.md` and `docs/std/strings.md` (byte-oriented APIs)

## Current API (Implemented)

`std::buffer` provides:

- `BufferU8`: an owning, growable **packed byte buffer** (byte-addressed `ptr`,
  with `len` and `cap` measured in bytes).
- width-oriented scalar buffer aliases built on `std::vector::Vector(T)` for
  convenience in the current subset.

### `BufferU8`

```silk
module std::buffer;

import std::arrays;
import std::memory;

struct BufferU8 {
  ptr: u64,
  cap: i64,
  len: i64,
}

impl BufferU8 {
  public fn init (cap: i64) -> std::result::Result(BufferU8, std::memory::AllocFailed);
  public fn empty () -> BufferU8;
  public fn push (mut self: &BufferU8, value: u8) -> std::memory::OutOfMemory?;
  public fn push_bytes (mut self: &BufferU8, bytes: std::arrays::ByteSlice) -> std::memory::OutOfMemory?;
  public fn pop (mut self: &BufferU8) -> u8?;
  public fn get (self: &BufferU8, index: i64) -> u8;
  public fn set (mut self: &BufferU8, index: i64, value: u8) -> void;
  public fn at (self: &BufferU8, index: i64) -> u8?;
  public fn try_set (mut self: &BufferU8, index: i64, value: u8) -> bool;
  public fn swap_remove (mut self: &BufferU8, index: i64) -> u8?;
  public fn clear (mut self: &BufferU8) -> void;
  public fn reserve_additional (mut self: &BufferU8, additional: i64) -> std::memory::OutOfMemory?;
  public fn as_bytes (self: &BufferU8) -> std::arrays::ByteSlice;
  public fn drop (mut self: &BufferU8) -> void;
}
```

### Width-oriented aliases

```silk
module std::buffer;

import std::vector;

// Signed integers.
export type BufferI8 = std::vector::Vector(i8);
export type BufferI16 = std::vector::Vector(i16);
export type BufferI32 = std::vector::Vector(i32);
export type BufferI64 = std::vector::Vector(i64);

// Unsigned integers.
export type BufferU16 = std::vector::Vector(u16);
export type BufferU32 = std::vector::Vector(u32);
export type BufferU64 = std::vector::Vector(u64);

// Floating point.
export type BufferF32 = std::vector::Vector(f32);
export type BufferF64 = std::vector::Vector(f64);
```

Notes:

- `BufferU8` is a packed byte buffer. Its `ptr` can be passed directly to
  byte-oriented OS/FFI APIs alongside `len`.
- `BufferU8.init(cap)` returns `Err(AllocFailed)` rather than silently
  returning an empty buffer when allocation fails. Use `BufferU8.empty()` for
  infallible construction.
- growth paths (`reserve_additional`, `push`, `push_bytes`) surface allocation
  failure as `std::memory::OutOfMemory?` (including internal size arithmetic
  overflow; leaves the buffer unchanged on failure).
- The width-oriented aliases are still backed by `std::vector::Vector(T)` in
  the current subset, so their underlying storage follows the
  scalar-slot model described in `docs/std/vector.md`.
