# Buffers

`Buffer(T)` provides low-level access to a contiguous block of memory. It is
intentionally unsafe and used as a foundation for higher-level collections and
strings.

Key points:

- `Buffer(T)` is a “fat pointer” with:
 - a raw pointer to the start of the memory block,
 - a capacity (number of elements that can be stored).
- `Buffer(T)` does **not** track the number of initialized elements (length).
- `Buffer(T)` uses the current compiler’s **scalar-slot** layout (for example
 `sizeof(u8) == 8`). For packed bytes suitable for OS/FFI byte APIs, use
 `std::buffer::BufferU8`.
- The current API includes operations such as:
 - allocation: `std::buffer::Buffer(T).init(cap)` / `std::buffer::alloc(T; cap)`
 - reads/writes: `buf.read(i)` / `buf.write(i, v)` and module-level wrappers
 - views: `buf.view(len)` / `buf.slice(start, end)` returning `std::arrays::Slice(T)`

Safety model (layered):

- Layer 1: unsafe `Buffer(T)` primitive (`ptr + cap`, no tracked initialization).
- Layer 2: verifier checks (borrow/ownership rules in the language subset).
- Layer 3: Formal Silk proofs (contracts, invariants, and struct requirements).

## Notes



The shipped stdlib provides `std::buffer::Buffer(T)` as an owning, fixed-capacity
buffer for scalar-slot `T` values, backed by `std::runtime::mem::{alloc,free}`.
The buffer surface is written so it can be used in verified code:

- structural invariants are captured in `std::formal::buffer_well_formed(ptr, cap)`,
- bounds checks are expressed via `std::formal::bounds_i64` / `slice_range_i64`,
- and higher-level containers can layer length tracking and element lifecycle
 rules on top.

`std::buffer` also continues to provide:

- `BufferU8`: a packed, growable byte buffer for OS/FFI byte APIs (byte-addressed
 `ptr`, with `len`/`cap` in bytes), and
- width-oriented aliases backed by `std::vector::Vector(T)` for convenience.
