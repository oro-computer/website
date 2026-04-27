# `std::map`

`std::map` provides associative containers:

- `HashMap(K, V)` (unordered, hash table),
- `TreeMap(K, V)` (ordered, red-black tree).

Canonical doc: [map](?p=std/map).

## Notes

- Supported forms: usable in Silk currently with documented limits.
- Details: [map](?p=std/map)

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
  match (Map.init(16)) {
    InitResult::Ok(map) => {
      let mut m: Map = map;
      m.put(1, 10);
      let v: int = m.get(1) ?? 0;
      m.drop();
      return v;
    },
    InitResult::Err(_) => {
      return 2;
    },
  }
}
```

## See also

- Canonical doc: [map](?p=std/map)
- Type-system reference: [types](?p=language/types)
