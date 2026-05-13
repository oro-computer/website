# `std::set`

`std::set` provides set containers:

- `SetMap(T)` (unordered set, open addressing),
- `TreeSet(T)` (ordered set, red-black tree).

Canonical doc: [set](?p=std/set).

## Notes

- Supported forms: usable in Silk currently with documented limits.
- Details: [set](?p=std/set)

## Importing

```silk
import set from "std/set";
```

## Examples

### Example: `SetMap(u64)` basic usage
```silk
import set from "std/set";
import memory from "std/memory";

type Set = set::SetMap(u64);
type InitResult = Result(Set, memory::AllocFailed);
type InsertResult = Result(bool, memory::OutOfMemory);

fn main () -> int {
  match (Set.init(4)) {
    InitResult::Ok(set) => {
      let mut s: Set = set;

      let insert_r: InsertResult = s.insert(1);
      if insert_r.is_err() { s.drop(); return 2; }
      let ok: bool = s.contains(1);
      s.drop();
      if ok { return 0; }
      return 1;
    },
    InitResult::Err(_) => {
      return 1;
    },
  }
}
```

## See also

- Canonical doc: [set](?p=std/set)
- Iterator protocol: [interfaces](?p=std/interfaces)
