# Regions (`with`)

Regions provide a fixed-size, statically allocated backing store that can be
used as an allocation context for `new`.

Conceptually: a region behaves like an arena (bump) allocator. Silk uses the
term “region” for the user-facing language feature.

Canonical spec: `docs/language/regions.md`.

## Status

- Implemented subset + current limitations: `docs/language/regions.md`
- End-to-end fixtures: `tests/silk/pass_region_*.slk`

## Syntax

```silk
const region scratch: u8[1024];

with scratch {
  // `new` allocations use `scratch` as backing storage.
}
```

## Example

```silk
struct Point {
  x: int,
  y: int,
}

fn main () -> int {
  const region scratch: u8[1024];
  with scratch {
    let p: &Point = new Point{ x: 1, y: 2 };
    return p.x + p.y;
  }
}
```

## See also

- Canonical spec: `docs/language/regions.md`
- Memory model and `new`: `wiki/language/memory-model.md`
- `--noheap` and `std::runtime::mem`: `docs/std/runtime.md`
