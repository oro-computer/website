# Buffers (`Buffer(T)`) (design)

The long-term design includes an intrinsic `Buffer(T)` type for low-level,
unsafe contiguous memory access, intended to sit underneath safe collections.

Canonical design doc: `docs/language/buffers.md`.

In the current toolchain, buffer-like functionality is provided via `std::`:

- `std::vector::Vector(T)` for owning growable storage
- `std::buffer::BufferU8` as an owning packed byte buffer, plus width-oriented
  scalar buffer aliases (`BufferI32`, etc.)

## Example: buffer aliases
```silk
import std::buffer;

fn main () -> int {
  let mut b = match BufferU8.init(4) {
    Ok(v) => v,
    Err(_) => return 1,
  };
  b.push(1 as u8);
  b.drop();
  return 0;
}
```

## See also

- Canonical design doc: `docs/language/buffers.md`
- `std::buffer`: `docs/wiki/std/buffer.md`
- `std::vector`: `docs/wiki/std/vector.md`
