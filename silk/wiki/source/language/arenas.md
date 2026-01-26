# Arenas (legacy)

The “arenas” concept has been renamed and reworked as **regions**.

Canonical pointer: `docs/language/arenas.md`  
Current spec: `docs/language/regions.md`

## Example (Works today)

The legacy “arena allocation” idea is expressed as region allocation via `with`:

```silk
struct Point {
  x: int,
  y: int,
}

fn main () -> int {
  const region arena: u8[1024];
  with arena {
    let p: &Point = new Point{ x: 1, y: 2 };
    return p.x + p.y;
  }
}
```

## See also

- Regions (wiki): `docs/wiki/language/regions.md`
