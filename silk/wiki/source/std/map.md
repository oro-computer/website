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
import map from "std/map";
```

## Examples

### Example: `HashMap(u64, int)` basic usage
```silk
import map from "std/map";
import memory from "std/memory";

type Map = map::HashMap(u64, int);
type InitResult = Result(Map, memory::AllocFailed);

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
- Removed builtin `map(K, V)`: [types](?p=language/types)
