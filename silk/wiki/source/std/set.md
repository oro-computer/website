# `std::set`

`std::set` provides set containers:

- `SetMap(T)` (unordered set, open addressing),
- `TreeSet(T)` (ordered set, red-black tree).

[Canonical doc](../docs/?p=std/set).

## Status

- Implemented subset: usable in the current compiler subset with documented limits.
- [Details](../docs/?p=std/set)

## Importing

```silk
import std::set;
```

## Examples

### Example: `SetMap(u64)` basic usage
```silk
import std::set;
import std::result;
import std::memory;

type Set = std::set::SetMap(u64);
type InitResult = std::result::Result(Set, std::memory::AllocFailed);
type InsertResult = std::result::Result(bool, std::memory::OutOfMemory);

fn main () -> int {
  let mut s = match Set.init(4) {
    InitResult::Ok(v) => v,
    InitResult::Err(_) => return 1,
  };

  let insert_r: InsertResult = s.insert(1);
  if insert_r.is_err() { s.drop(); return 2; }
  let ok: bool = s.contains(1);
  s.drop();
  if ok { return 0; }
  return 1;
}
```

## See also

- [Canonical doc](../docs/?p=std/set)
- Iterator protocol: [std::interfaces](../docs/?p=std/interfaces)
