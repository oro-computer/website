---
layout: "docs"
description: "This module provides a generic, growable vector type Vector(T) used broadly across std::."
docsCollection: "silk"
section: "std"
order: 81
sourcePath: "std/vector.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::vector`](/silk/docs/std/vector/)

This module provides a generic, growable
vector type `Vector(T)` used broadly across `std::`.

`Vector(T)` is an owning container with:

- a contiguous heap allocation,
- a logical length (`len`), and
- a capacity (`cap`) in elements.

the compiler uses a conservative scalar-slot memory model
for most scalar values; [`std::vector`](/silk/docs/std/vector/) is specified in terms of the logical
element type `T`, not a stable packed byte layout. In particular, in the
Supported forms `Vector(T)` stores elements using the scalar-slot
layout of `T` (each slot is 8 bytes). Each element occupies `sizeof(T)` bytes
(a multiple of 8 in the Supported forms), so multi-slot values like `string` and
non-opaque structs/enums are supported. This is still not a packed byte
representation: for example `sizeof(u8) == 8` in the Supported forms, so
`Vector(u8)` stores one byte per 8-byte slot. Use [`std::buffer::BufferU8`](/silk/docs/std/buffer/) when
packed bytes matter.

Where byte-exact layout matters (I/O buffers, strings), the stdlib uses
[`std::buffer::BufferU8`](/silk/docs/std/buffer/), a packed byte buffer whose `ptr` points to
byte-addressed memory and whose `len`/`cap` are in bytes.

See also:

- [arrays](/silk/docs/std/arrays/) ([`std::arrays::Slice(T)`](/silk/docs/std/arrays/) views)
- [buffer](/silk/docs/std/buffer/) (width-oriented buffer helpers built on vectors)
- [generics](/silk/docs/language/generics/) (generic syntax and rules)

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
      // `tabs` is dropped on scope exit (drops elements + frees its allocation).
      return None;
    }
    i = i + 1;
  }

  return Some(tabs);
}
```

## Ownership and `Drop`

`Vector(T)` is an owning container:

- `push` moves a value into the vector.
- `pop` / `swap_remove` move a value out of the vector (the caller owns the
 returned value).
- `set` overwrites an element and runs `Drop` for the overwritten element when
 `T` requires drop.
- `clear` runs `Drop` for all live elements and then sets `len = 0`.
- `drop` runs `Drop` for all live elements, frees the backing allocation, and
 resets the vector to an empty state.

### Copy accessors (`get`, `iter`)

`get`, `at`, and `iter` produce values by value without removing them. In other
words, they copy element bytes out of the vector.

These accessors are intended for plain value types (primitives, `string` views,
and small POD structs). For `Drop`-managed element types, copying an element out
creates duplicate ownership; use move-out operations like `pop` / `swap_remove`
instead of `get`/`iter`.

## [`std::interfaces`](/silk/docs/std/interfaces/) surface

`Vector(T)` is one of the stdlib’s canonical owning container types, so its
interface surface is intentionally aligned with the rest of `std::`:

- `Vector(T)` implements [`std::interfaces::Len`](/silk/docs/std/interfaces/).
- `Vector(T)` implements [`std::interfaces::Capacity`](/silk/docs/std/interfaces/).
- `Vector(T)` implements [`std::interfaces::IsEmpty`](/silk/docs/std/interfaces/).
- `Vector(T)` implements [`std::interfaces::Clear`](/silk/docs/std/interfaces/).
- `Vector(T)` implements [`std::interfaces::ReserveAdditional`](/silk/docs/std/interfaces/).
- `Vector(T)` implements [`std::interfaces::Drop`](/silk/docs/std/interfaces/).
- `Vector.iter()` returns [`std::arrays::SliceIter(T)`](/silk/docs/std/arrays/), so iteration reuses the
 shared [`std::interfaces::Iterator(T)`](/silk/docs/std/interfaces/) surface documented by [`std::arrays`](/silk/docs/std/arrays/)
 instead of inventing a vector-specific iterator type.

That split is the intended reader-facing style:

- `Vector(T)` is the owning growable container that exposes the standard
 container-management protocols.
- [`std::arrays::Slice(T)`](/silk/docs/std/arrays/) / `SliceIter(T)` provide the non-owning view and
 iteration vocabulary layered on top of that storage.

This makes the stdlib easier to learn by reading: vectors, slices, maps, sets,
and buffers all participate in a shared interface story instead of presenting a
different naming model for each module.

## Exported API

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

- `Vector(T)` is intentionally low-level in the Supported forms:
 - `init(cap)` returns `Err(AllocFailed)` when allocation fails or when `cap`
 is invalid.
 - `try_init(cap)` returns `None` on any allocation/validation failure.
 - prefer `Vector.empty()` over `Vector.init(0)` for a clear “default” constructor.
 - growth paths (`reserve_additional`, `push`, `extend_from_slice`) surface
 allocation failure as [`std::memory::OutOfMemory?`](/silk/docs/std/memory/) (including internal size
 arithmetic overflow; leaves the vector unchanged on failure).
- Bounds checks are expressed as `#require` contracts (and reusable [`std::formal`](/silk/docs/std/formal/)
 theories) for verifier tooling; they are not runtime checks in the current
 compiler subset.
- `at` / `try_set` are “checked” accessors:
 - `at` returns `None` when `index` is out of bounds,
 - `try_set` returns `false` when `index` is out of bounds.
- `swap_remove` removes an element by swapping in the last element (O(1), order not preserved).
