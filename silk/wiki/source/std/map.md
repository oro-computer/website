# `std::map`

`std::map` provides associative containers:

- `HashMap(K, V)` (unordered, hash table),
- `TreeMap(K, V)` (ordered, red-black tree).

Canonical doc: `docs/std/map.md`.

## Status

- Implemented subset: usable in the current compiler subset with documented limits.
- Details: `docs/std/map.md` and `STATUS.md`

## Importing

```silk
import std::map;
```

## Examples

### Works today: `HashMap(u64, int)` basic usage

```silk
import std::map;
import std::result;
import std::memory;

type Map = std::map::HashMap(u64, int);
type InitResult = std::result::Result(Map, std::memory::AllocFailed);

fn hash_u64 (k: u64) -> u64 { return k; }
fn eq_u64 (a: u64, b: u64) -> bool { return a == b; }

fn main () -> int {
  let init_r: InitResult = Map.init(16, hash_u64, eq_u64);
  if init_r.is_err() { return 2; }
  let mut m: Map = match (init_r) {
    InitResult::Ok(v) => v,
    InitResult::Err(_) => Map.empty(hash_u64, eq_u64),
  };
  (mut m).put(1, 10);
  let v: int = m.get(1) ?? 0;
  (mut m).drop();
  return v;
}
```

## See also

- Canonical doc: `docs/std/map.md`
- Removed builtin `map(K, V)`: `docs/language/types.md`
