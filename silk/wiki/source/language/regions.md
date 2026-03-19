# Regions (`with`)

Regions provide a fixed-size, statically allocated backing store that can be
used as an allocation context for `new`.

Canonical doc: [`/silk/docs/?p=language/regions`](/silk/docs/?p=language/regions).

## Status

- The shipped `region` / `with` surface and active boundaries are documented in
  [`/silk/docs/?p=language/regions`](/silk/docs/?p=language/regions).
- End-to-end fixtures live under `tests/silk/pass_region_*.slk`.

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

- Canonical doc: [`/silk/docs/?p=language/regions`](/silk/docs/?p=language/regions)
- Memory model and `new`: [`/silk/wiki/?p=language/memory-model`](/silk/wiki/?p=language/memory-model)
- `--noheap` and `std::runtime::mem`: [`/silk/docs/?p=std/runtime`](/silk/docs/?p=std/runtime)
