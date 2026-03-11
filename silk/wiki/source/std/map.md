# `std::map`

`std::map` provides associative containers:

- `HashMap(K, V)` (unordered, hash table),
- `TreeMap(K, V)` (ordered, red-black tree).

[Canonical doc](../docs/?p=std/map).

## Status

- Implemented subset: usable in the current compiler subset with documented limits.
- [Details](../docs/?p=std/map)

## Importing

```silk
import std::map;
```

## Examples

### Example: `HashMap(u64, int)` basic usage
```silk
import std::map;
import std::result;
import std::memory;

type Map = std::map::HashMap(u64, int);
type InitResult = std::result::Result(Map, std::memory::AllocFailed);

fn main () -> int {
  let mut m = match Map.init(16) {
    InitResult::Ok(v) => v,
    InitResult::Err(_) => return 2,
  };
  m.put(1, 10);
  let v: int = m.get(1) ?? 0;
  m.drop();
  return v;
}
```

## See also

- [Canonical doc](../docs/?p=std/map)
- Removed builtin `map(K, V)`: [Types](../docs/?p=language/types)
