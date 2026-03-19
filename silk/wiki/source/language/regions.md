# Regions (`with`)

Regions provide a fixed-size, statically allocated backing store that can be
used as an allocation context for `new`.

Canonical spec: `docs/language/regions.md`.

## Status

- Implemented subset + current limitations: `docs/language/regions.md`
- End-to-end fixtures: `tests/silk/pass_region_*.slk`

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

- Canonical spec: `docs/language/regions.md`
- Memory model and `new`: `docs/wiki/language/memory-model.md`
- `--noheap` and `std::runtime::mem`: `docs/std/runtime.md`
