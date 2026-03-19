# `std::buffer`

Status: **Implemented (scalar-slot + packed bytes)**. `std::buffer` provides:

- `Buffer(T)`: an owning, fixed-capacity **scalar-slot** buffer (cap measured in
  elements), with view/slice helpers returning `std::arrays::Slice(T)`.
- `BufferU8`: an owning, growable **packed byte buffer** (byte-addressed `ptr`,
  with `len`/`cap` measured in bytes).

In the long-term design, the compiler may treat `Buffer(T)` as a special
primitive, but the shipped stdlib surface is already usable end-to-end (see
`docs/language/buffers.md`).

See also:

- `docs/std/vector.md` (`Vector(T)`)
- `docs/language/buffers.md` (intrinsic `Buffer(T)` design)
- `docs/std/io.md` and `docs/std/strings.md` (byte-oriented APIs)

## Exported API

`std::buffer` provides:

- `Buffer(T)`: an owning, fixed-capacity scalar-slot buffer for `T` values.
- `BufferU8`: an owning, growable **packed byte buffer** (byte-addressed `ptr`,
  with `len` and `cap` measured in bytes).
- width-oriented scalar buffer aliases built on `std::vector::Vector(T)` for
  convenience in the current subset.

### `Buffer(T)`

```silk
module std::buffer;

import std::arrays;
import std::memory;

struct Buffer(T) {
  ptr: u64,
  cap: i64,
}

impl Buffer(T) {
  public fn init (cap: i64) -> std::result::Result(Buffer(T), std::memory::AllocFailed);
  public fn empty () -> Buffer(T);
  public fn read (self: &Buffer(T), index: i64) -> T;
  public fn write (mut self: &Buffer(T), index: i64, value: T) -> void;
  public fn view (self: &Buffer(T), len: i64) -> std::arrays::Slice(T);
  public fn slice (self: &Buffer(T), start: i64, end: i64) -> std::arrays::Slice(T);
  public fn drop (mut self: &Buffer(T)) -> void;
}

// Module-level wrappers (synonyms for the methods above).
export fn alloc (T; cap: i64) -> std::result::Result(Buffer(T), std::memory::AllocFailed);
export fn capacity (T; buf: &Buffer(T)) -> i64;
export fn drop (T; mut buf: &Buffer(T)) -> void;
export fn read (T; buf: &Buffer(T), index: i64) -> T;
export fn write (T; mut buf: &Buffer(T), index: i64, value: T) -> void;
export fn view (T; buf: &Buffer(T), len: i64) -> std::arrays::Slice(T);
export fn slice (T; buf: &Buffer(T), start: i64, end: i64) -> std::arrays::Slice(T);
```

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

- `Buffer(T)` is a scalar-slot buffer: `cap` is in elements, and the allocation
  size is `cap * sizeof(T)` bytes (in the current backend subset, `sizeof(u8) == 8`).
  For packed bytes suitable for OS/FFI byte APIs, use `BufferU8`.
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
