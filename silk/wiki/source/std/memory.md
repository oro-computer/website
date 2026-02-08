# `std::memory`

`std::memory` provides low-level helpers and the long-term allocator design.

Canonical doc: `docs/std/memory.md`.

## Importing

```silk
import std::memory;
```

## Example (Works today): alignment helpers

```silk
import std::memory;

fn main () -> int {
 if !std::memory::is_power_of_two_u64(8) { return 1; }
 if std::memory::align_up_u64(9, 8) != 16 { return 2; }
 return 0;
}
```

## See also

- Canonical doc: `docs/std/memory.md`
- Regions: `docs/wiki/language/regions.md`
