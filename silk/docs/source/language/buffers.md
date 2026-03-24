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

## Role in the language

- Treat `Buffer(T)` as an intrinsic type with special semantics.
- Ensure the verifier has enough information to reason about buffer safety.
- Coordinate with the standard library so that safe collections are built on top of `Buffer(T)`.

## Notes

Silk defines `Buffer(T)` as the low-level storage primitive for contiguous
memory. In practice, downstream code currently uses the concrete `std::buffer`
and `std::vector` surfaces below:

- `std::vector::Vector(T)` provides growable, contiguous storage for scalar
  element types.
- `std::buffer` provides width-oriented buffer helpers:
  - `BufferU8` is an owning packed byte buffer (byte-addressed `ptr`, with
    `len`/`cap` in bytes),
  - the remaining width buffers are `std::vector::Vector(T)`-backed aliases in
    the current subset.
- Raw allocation and low-level memory intrinsics remain confined to
  `std::runtime::mem`.

This keeps raw allocation details in runtime helpers while higher-level
collections remain explicit in the standard library.

## Practical Today: `std::buffer` and `std::vector`

Until the full intrinsic surface lands, downstream code should usually reach
for the current stdlib layers directly:

```silk
import std::buffer;
import std::vector;

fn main () -> int {
  let mut bytes = match std::buffer::BufferU8.init(4) {
    Ok(v) => v,
    Err(_) => return 1,
  };
  if bytes.push(1 as u8) != None { bytes.drop(); return 2; }
  if bytes.push(2 as u8) != None { bytes.drop(); return 3; }

  let mut values = std::vector::Vector(int).empty();
  if values.push(10) != None { values.drop(); bytes.drop(); return 4; }
  if values.push(20) != None { values.drop(); bytes.drop(); return 5; }

  values.drop();
  bytes.drop();
  return 0;
}
```

- Use `std::buffer::BufferU8` when you need explicit packed-byte ownership.
- Use `std::vector::Vector(T)` for typed, growable storage.
- Keep raw allocation details inside `std::runtime::mem` and stdlib helpers
  rather than open-coding them in application code.
