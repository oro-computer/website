# `std::memory`

Status: **Design document**. This describes intended memory APIs; it is not
implemented yet.

`std::memory` provides allocation interfaces and low-level memory utilities.
It sits at the bottom of most other std modules.

See also:

- `docs/language/arenas.md` (historical pointer; renamed to regions)
- `docs/language/regions.md` (`region`, `with`, and region-backed `new`)
- `docs/language/buffers.md` (`Buffer(T)` intrinsic)
- `docs/std/conventions.md` (allocation conventions)

## Implemented API

A small subset is implemented in `std/memory.slk` for early compiler bring-up.
These helpers are pure and operate on scalar types only, plus a shared
allocation-failure error type used across `std::`.

```silk
module std::memory;

export error OutOfMemory {
  requested: i64
}

enum AllocErrorKind {
  OutOfMemory,
  InvalidInput,
  Overflow,
  Unknown,
}

export error AllocFailed {
  code: int,
  requested: i64,
}

impl AllocFailed {
  public fn kind (self: &AllocFailed) -> AllocErrorKind;
}

export fn alloc_failed (kind: AllocErrorKind, requested: i64) -> AllocFailed;

export fn is_power_of_two_u64 (x: u64) -> bool;
export fn align_up_u64 (value: u64, alignment: u64) -> u64;
export fn align_down_u64 (value: u64, alignment: u64) -> u64;
export fn div_ceil_u64 (n: u64, d: u64) -> u64;
```

Notes:

- `align_*` functions require `alignment` to be a power of two.
- `OutOfMemory` is the shared error type returned by allocation-backed
  containers and builders (for example `std::vector::Vector` and
  `std::strings::StringBuilder`) when capacity growth cannot allocate.
- `AllocFailed` is a small, stable “constructor failed” error used by APIs
  like `BufferU8.init` / `Vector(T).init` where invalid inputs (negative
  capacities, overflow) must be distinguished from out-of-memory.
## Scope

`std::memory` is responsible for:

- Defining allocator interfaces used by other `std::` modules.
- Providing safe wrappers around region allocation and the intrinsic `Buffer(T)` type
  (where possible).
- Providing low-level memory operations (`memcpy`, `memcmp`, zeroing, etc.).
- Defining common allocation error conventions (`OutOfMemory`, etc.).

Non-goals (initially):

- A full garbage collector (explicit allocation is the design baseline).
- Region inference beyond the region model already described in the language
  docs.

## Intrinsics and Their Std Surface

The language defines:

- regions (`docs/language/regions.md`) as an allocation context for `new`,
- `Buffer(T)` as an intrinsic “fat pointer” (`docs/language/buffers.md`).

The buffer document enumerates intrinsic operations under the `std::buffer::`
namespace (allocation, read/write, drop, view/slice). The `std::memory` design
assumes those operations exist (implemented by the compiler/runtime) and that
higher-level containers in `std::arrays` and `std::strings` are layered on top.

## Allocator Interface (Initial Design)

The stdlib needs a first-class allocator abstraction so that:

- containers can be written without hardcoding a global heap,
- freestanding builds can provide their own allocator,
- hosted builds can use an OS-backed allocator.

Illustrative sketch:

```silk
module std::memory;

export enum AllocError {
  OutOfMemory,
}

export interface Allocator {
  // Allocate `n` elements of type `T`.
  alloc: fn(T, n: int) -> Result(Buffer(T), AllocError);
  // Resize an existing allocation.
  realloc: fn(T, buf: Buffer(T), old_n: int, new_n: int) -> Result(Buffer(T), AllocError);
  // Free an allocation.
  free: fn(T, buf: Buffer(T), n: int) -> void;
}
```

The exact interface depends on how generics and interfaces are represented in
the implemented language. The key requirement is that containers can accept an
allocator value and use it consistently.

## Common Utilities

`std::memory` should provide low-level routines that are useful across the
stdlib:

- `copy(dst, src, n)`
- `move(dst, src, n)`
- `set(dst, byte, n)`
- `zero(dst, n)`
- `equal(a, b, n)`

These should have both safe and “unchecked” variants where appropriate, so that
verified code can elide bounds checks while still keeping safety explicit.
