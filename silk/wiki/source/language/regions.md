# Regions (`with`)

Regions provide a fixed-size, statically allocated backing store that can be
used as an allocation context for `new`.

[Canonical spec](../docs/?p=language/regions).

## Status

- Implemented subset + current limitations: [Regions](../docs/?p=language/regions)

## Syntax
```silk
const region scratch_region: u8[1024];

with scratch_region {
  // `new` allocations use `scratch_region` as backing storage.
}
```

## Example
```silk
struct Point {
  x: int,
  y: int,
}

fn main () -> int {
  const region scratch_region: u8[1024];
  with scratch_region {
    let p: &Point = new Point{ x: 1, y: 2 };
    return p.x + p.y;
  }
}
```

## See also

- [Canonical spec](../docs/?p=language/regions)
- Memory model and `new`: [Memory Model (Stack, Heap, and Moves)](../docs/?p=language/memory-model)
- `--noheap` and `std::runtime::mem`: [std::runtime](../docs/?p=std/runtime)
