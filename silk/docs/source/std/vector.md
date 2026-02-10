# `std::vector`

Status: **Initial implementation + design**. This module provides a generic, growable
vector type `Vector(T)` used broadly across `std::`.

`Vector(T)` is an owning container with:

- a contiguous heap allocation,
- a logical length (`len`), and
- a capacity (`cap`) in elements.

The current compiler/backend subset uses a conservative scalar-slot memory model
for most scalar values; `std::vector` is specified in terms of the logical
element type `T`, not a stable packed byte layout. In particular, in the
current subset `Vector(T)` stores elements using the scalar-slot
layout of `T` (each slot is 8 bytes). Each element occupies `sizeof(T)` bytes
(a multiple of 8 in the current subset), so multi-slot values like `string` and
non-opaque structs/enums are supported. This is still not a packed byte
representation: for example `sizeof(u8) == 8` in the current subset, so
`Vector(u8)` stores one byte per 8-byte slot. Use `std::buffer::BufferU8` when
packed bytes matter.

Where byte-exact layout matters (I/O buffers, strings), the stdlib uses
`std::buffer::BufferU8`, a packed byte buffer whose `ptr` points to
byte-addressed memory and whose `len`/`cap` are in bytes.

See also:

- `docs/std/arrays.md` (`std::arrays::Slice(T)` views)
- `docs/std/buffer.md` (width-oriented buffer helpers built on vectors)
- `docs/language/generics.md` (generic syntax and rules)

## Example (Struct Elements)

`Vector(T)` is the stdlib’s default growable container for typed elements. When
you see code manually managing `{ ptr, len, cap }` for a typed array, it is
often a sign that a `Vector(T)` (or a small wrapper around it) is the intended
tool.

This example collects `TabState` values into a `Vector(TabState)`:

```silk
import std::arrays;
import std::vector;

struct TabState {
  path: string,
  top_off: i64,
  gutter_on: bool,
}

type Tabs = std::vector::Vector(TabState);

fn tabs_collect (paths: std::arrays::Slice(string)) -> Tabs? {
  let cap: i64 = paths.len;
  let mut tabs: Tabs = Tabs.try_init(cap) ?? Tabs.empty();

  var i: i64 = 0;
  while i < paths.len {
    let err = tabs.push(TabState{ path: paths.get(i), top_off: 0, gutter_on: false });
    if err != None {
      return None; // `tabs` is dropped on scope exit (frees its allocation).
    }
    i = i + 1;
  }

  return Some(tabs);
}
```

## Current API (Implemented)

```silk
module std::vector;

import std::arrays;
import std::interfaces;

struct Vector(T) {
  ptr: u64,
  cap: i64,
  len: i64,
}

impl Vector(T) {
  public fn init (cap: i64) -> std::result::Result(Vector(T), std::memory::AllocFailed);
  public fn try_init (cap: i64) -> Vector(T)?;
  public fn empty () -> Vector(T);
  public fn push (mut self: &Vector(T), value: T) -> std::memory::OutOfMemory?;
  public fn pop (mut self: &Vector(T)) -> T?;
  public fn get (self: &Vector(T), index: i64) -> T;
  public fn set (mut self: &Vector(T), index: i64, value: T) -> void;
  public fn at (self: &Vector(T), index: i64) -> T?;
  public fn try_set (mut self: &Vector(T), index: i64, value: T) -> bool;
  public fn swap_remove (mut self: &Vector(T), index: i64) -> T?;
  public fn extend_from_slice (mut self: &Vector(T), s: std::arrays::Slice(T)) -> std::memory::OutOfMemory?;
  public fn as_slice (self: &Vector(T)) -> std::arrays::Slice(T);
  public fn iter (self: &Vector(T)) -> std::arrays::SliceIter(T);
}

impl Vector(T) as std::interfaces::Len {
  public fn len (self: &Vector(T)) -> i64;
}

impl Vector(T) as std::interfaces::Capacity {
  public fn capacity (self: &Vector(T)) -> i64;
}

impl Vector(T) as std::interfaces::IsEmpty {
  public fn is_empty (self: &Vector(T)) -> bool;
}

impl Vector(T) as std::interfaces::Clear {
  public fn clear (mut self: &Vector(T)) -> void;
}

impl Vector(T) as std::interfaces::ReserveAdditional {
  public fn reserve_additional (mut self: &Vector(T), additional: i64) -> std::memory::OutOfMemory?;
}

impl Vector(T) as std::interfaces::Drop {
  public fn drop (mut self: &Vector(T)) -> void;
}
```

Notes:

- `Vector(T)` is intentionally low-level in the current subset:
  - `init(cap)` returns `Err(AllocFailed)` when allocation fails or when `cap`
    is invalid.
  - `try_init(cap)` returns `None` on any allocation/validation failure.
  - prefer `Vector.empty()` over `Vector.init(0)` for a clear “default” constructor.
  - growth paths (`reserve_additional`, `push`, `extend_from_slice`) surface
    allocation failure as `std::memory::OutOfMemory?` (including internal size
    arithmetic overflow; leaves the vector unchanged on failure).
- Bounds checks are expressed as `#require` contracts (and reusable `std::formal`
  theories) for verifier tooling; they are not runtime checks in the current
  compiler subset.
- `at` / `try_set` are “checked” accessors:
  - `at` returns `None` when `index` is out of bounds,
  - `try_set` returns `false` when `index` is out of bounds.
- `swap_remove` removes an element by swapping in the last element (O(1), order not preserved).
