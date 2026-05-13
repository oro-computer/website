# `std::buffer`

In the in-tree stdlib, `std::buffer` provides a packed byte buffer
(`BufferU8`) plus width-oriented scalar buffer aliases built on
`std::vector::Vector(T)` (for example `BufferI32`).

Canonical doc: [buffer](?p=std/buffer).

## Importing

```silk
import { BufferU8 } from "std/buffer";
```

## Example: `BufferU8`
```silk
import { BufferU8 } from "std/buffer";

fn main () -> int {
  match (BufferU8.init(4)) {
    Ok(buffer) => {
      let mut b: BufferU8 = buffer;
      b.push(1 as u8);
      b.push(2 as u8);
      if b.pop() != Some(2 as u8) {
        b.drop();
        return 1;
      }
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

- Canonical doc: [buffer](?p=std/buffer)
- Intrinsic buffer design: [buffers](?p=language/buffers)
