# Memory model

This page is a learning-oriented companion to the canonical memory model:
`docs/language/memory-model.md`.

At a high level:

- Most values are plain, copyable scalars (or structs that lower to a fixed set
  of scalar slots in the current backend subset).
- Heap allocation is introduced via `new`, producing `&Struct` references.
- `with` regions can redirect `new` allocations away from the heap (see regions).

## Status

- Canonical spec + implementation notes: `docs/language/memory-model.md`

## Example (Works today): `new` + reference field access

```silk
struct Point {
  x: int,
  y: int,
}

fn main () -> int {
  let p: &Point = new Point{ x: 1, y: 2 };
  return p.x + p.y;
}
```

## See also

- Regions (`with`): `docs/wiki/language/regions.md`
- `Drop` and cleanup hooks: `docs/std/interfaces.md`
