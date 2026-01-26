# `std::set`

`std::set` provides set containers:

- `SetMap(T)` (unordered set, open addressing),
- `TreeSet(T)` (ordered set, red-black tree).

Canonical doc: `docs/std/set.md`.

## Status

- Implemented subset: usable in the current compiler subset with documented limits.
- Details: `docs/std/set.md` and `STATUS.md`

## Importing

```silk
import std::set;
```

## Examples

### Works today: `SetMap(u64)` basic usage

```silk
import std::set;
import std::result;
import std::memory;

type Set = std::set::SetMap(u64);
type InitResult = std::result::Result(Set, std::memory::AllocFailed);
type InsertResult = std::result::Result(bool, std::memory::OutOfMemory);

fn hash_u64 (k: u64) -> u64 { return k; }
fn eq_u64 (a: u64, b: u64) -> bool { return a == b; }

fn main () -> int {
  let init_r: InitResult = Set.init(4, hash_u64, eq_u64);
  if init_r.is_err() { return 1; }
  let mut s: Set = match (init_r) {
    InitResult::Ok(v) => v,
    InitResult::Err(_) => Set.empty(hash_u64, eq_u64),
  };

  let insert_r: InsertResult = (mut s).insert(1);
  if insert_r.is_err() { (mut s).drop(); return 2; }
  let ok: bool = s.contains(1);
  (mut s).drop();
  if ok { return 0; }
  return 1;
}
```

## See also

- Canonical doc: `docs/std/set.md`
- Iterator protocol: `docs/std/interfaces.md`
