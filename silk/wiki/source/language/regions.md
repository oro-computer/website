# Regions (`with`)

Regions provide a fixed-size, statically allocated backing store that can be
used as an allocation context for `new`.

Canonical spec: [regions](?p=language/regions).

## Notes

- Supported forms + current limitations: [regions](?p=language/regions)
- End-to-end fixtures: `tests/silk/pass_region_*.slk`

## Syntax
```silk
const region region_buf: u8[1024];

with region_buf {
  // `new` allocations use `region_buf` as backing storage.
}
```

## Example
```silk
struct Point {
  x: int,
  y: int,
}

fn main () -> int {
  const region region_buf: u8[1024];
  with region_buf {
    let p: &Point = new Point{ x: 1, y: 2 };
    return p.x + p.y;
  }
}
```

## See also

- Canonical spec: [regions](?p=language/regions)
- Memory model and `new`: [memory model](?p=language/memory-model)
- `--noheap` and `std::runtime::mem`: [runtime](?p=std/runtime)
