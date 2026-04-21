# Memory model

This page is a learning-oriented companion to the canonical memory model:
[memory model](?p=language/memory-model).

At a high level:

- Most values are plain, copyable scalars (or structs that lower to a fixed set
 of scalar slots in the current backend subset).
- Heap allocation is introduced via `new`, producing `&Struct` references.
- `with` regions can redirect `new` allocations away from the heap (see regions).

## Notes

- Canonical spec + implementation notes: [memory model](?p=language/memory-model)

## Example: `new` + reference field access
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

- Regions (`with`): [regions](?p=language/regions)
- `Drop` and cleanup hooks: [interfaces](?p=std/interfaces)
