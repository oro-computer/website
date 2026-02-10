# Buffers

`Buffer(T)` is an intrinsic type providing low-level access to a contiguous block of memory. It is intentionally unsafe and used as a foundation for higher-level collections and strings.

Key points:

- `Buffer(T)` is a “fat pointer” with:
  - a raw pointer to the start of the memory block,
  - a capacity (number of elements that can be stored).
- `Buffer(T)` does **not** track the number of initialized elements (length).
- The intrinsic API includes operations such as:
  - `std::buffer::alloc`
  - `std::buffer::write`
  - `std::buffer::read`
  - `std::buffer::capacity`
  - `std::buffer::drop`
  - `std::buffer::view`
  - `std::buffer::slice`
- The safety model is layered:
  - Layer 1: unsafe `Buffer(T)` primitive.
  - Layer 2: compile-time safety via the verifier.
  - Layer 3: provable safety via Formal Silk (contracts, invariants, and struct requirements).

Compiler requirements:

- Treat `Buffer(T)` as an intrinsic type with special semantics.
- Ensure the verifier has enough information to reason about buffer safety.
- Coordinate with the standard library so that safe collections are built on top of `Buffer(T)`.

## Implementation Status (Current Compiler)

The full generic intrinsic `Buffer(T)` surface is part of the language design
but is not yet implemented end-to-end in the compiler and runtime.

To support early stdlib bring-up in the current compiler subset, the Silk compiler repository
provides a minimal buffer surface in `std::`:

- `std::vector::Vector(T)` provides growable, contiguous storage for scalar
  element types.
- `std::buffer` provides width-oriented buffer helpers:
  - `BufferU8` is an owning packed byte buffer (byte-addressed `ptr`, with
    `len`/`cap` in bytes),
  - the remaining width buffers are `std::vector::Vector(T)`-backed aliases in
    the current subset.
- Raw allocation and low-level memory intrinsics remain confined to
  `std::runtime::mem`.

As the compiler/runtime grows, the intrinsic `Buffer(T)` surface described in
this document is expected to become the lowest-level building block under
typed collections, with verifier-friendly contracts layered above it.
