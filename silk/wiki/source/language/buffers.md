# Buffers (`Buffer(T)`) (design)

The long-term design includes an intrinsic `Buffer(T)` type for low-level,
unsafe contiguous memory access, intended to sit underneath safe collections.

Canonical design doc: [buffers](?p=language/buffers).

In the current toolchain, buffer-like functionality is provided via `std::`:

- `std::vector::Vector(T)` for owning growable storage
- `std::buffer::BufferU8` as an owning packed byte buffer, plus width-oriented
 scalar buffer aliases (`BufferI32`, etc.)

## Example: buffer aliases
```silk
import std::buffer;

fn main () -> int {
  match (BufferU8.init(4)) {
    Ok(buffer) => {
      let mut b: BufferU8 = buffer;
      b.push(1 as u8);
      b.drop();
      return 0;
    },
    Err(_) => {
      return 1;
    },
  }
}
```

## See also

- Canonical design doc: [buffers](?p=language/buffers)
- `std::buffer`: [buffer](?p=std/buffer)
- `std::vector`: [vector](?p=std/vector)
