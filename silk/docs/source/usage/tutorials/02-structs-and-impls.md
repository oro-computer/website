# Tutorial 2: structs and `impl`

This tutorial covers:

- defining a `struct` (data layout)
- attaching behavior with `impl` blocks
- calling methods with explicit receivers (`self: &Self`, `mut self: &Self`)

Reference: `Structs, impls, layout` (see the sidebar under “Language”).

## 1) Define a struct

```silk
struct Packet {
  sequence: u32,
  size: u16,
  is_urgent: u8,
}
```

Structs define *shape*: fields and layout. Behavior lives in `impl` blocks.

## 2) Add behavior with an `impl` block

```silk
impl Packet {
  public fn mark_urgent (mut self: &Self) -> void {
    self.is_urgent = 1;
  }

  public fn is_large (self: &Self) -> bool {
    return self.size > 1024;
  }
}
```

Two important ideas:

- Methods are functions with an explicit receiver parameter (`self`).
- `mut self: &Self` means the method needs to mutate the value.

## 3) Use it (a complete program)

Create `packet.slk`:

```silk
import std::io::println;

struct Packet {
  sequence: u32,
  size: u16,
  is_urgent: u8,
}

impl Packet {
  public fn mark_urgent (mut self: &Self) -> void {
    self.is_urgent = 1;
  }

  public fn is_large (self: &Self) -> bool {
    return self.size > 1024;
  }
}

fn main () -> int {
  let mut p = Packet{ sequence: 1, size: 2048, is_urgent: 0 };

  if p.is_large() {
    (mut p).mark_urgent();
  }

  println("seq={d} urgent={d}", p.sequence as int, p.is_urgent as int);
  return 0;
}
```

Then:

```bash
silk check packet.slk
silk build packet.slk -o build/packet
./build/packet
```

## Optional: constructor overloads and `new`

Silk supports a conventional pattern for heap allocation: `new Type(...)` selects a `constructor` overload in an `impl`
block.

```silk
impl Packet {
  fn constructor (mut self: &Self, seq: u32, size: u16) -> void {
    self.sequence = seq;
    self.size = size;
    self.is_urgent = 0;
  }
}
```

This keeps construction explicit (you can read the initializer logic) without inventing a second “class system”.

## Next

- Tutorial 3: [Arrays and slices](?p=usage/tutorials/03-arrays-and-slices)
