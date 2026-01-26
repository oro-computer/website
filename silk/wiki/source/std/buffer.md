# `std::buffer`

In the in-tree stdlib, `std::buffer` provides a packed byte buffer
(`BufferU8`) plus width-oriented scalar buffer aliases built on
`std::vector::Vector(T)` (for example `BufferI32`).

Canonical doc: `docs/std/buffer.md`.

## Importing

```silk
import std::buffer;
```

## Example (Works today): `BufferU8`

```silk
import std::buffer;

fn main () -> int {
  let b_r = BufferU8.init(4);
  if b_r.is_err() { return 1; }
  let mut b: BufferU8 = match (b_r) {
    Ok(v) => v,
    Err(_) => BufferU8.empty(),
  };
  (mut b).push(1 as u8);
  (mut b).push(2 as u8);
  if (mut b).pop() != Some(2 as u8) {
    (mut b).drop();
    return 1;
  }
  (mut b).drop();
  return 0;
}
```

## See also

- Canonical doc: `docs/std/buffer.md`
- Intrinsic buffer design: `docs/language/buffers.md`
