# `std::set` — Sets

`std::set` provides standard set container surfaces:

- `SetMap(T)` — an unordered set backed by an open-addressing hash table.
- `TreeSet(T)` — an ordered set backed by a red-black tree.

Status: **initial implementation**. The API is specified here; the current implementation
targets the current compiler/backend subset and will grow as the language gains
first-class move/Drop semantics for values stored inside heap-backed data
structures.

## Design Goals

- Provide a consistent “set of unique values” container story in `std::` that
  mirrors `std::map`:
  - hashing + equality for `SetMap(T)`,
  - ordering comparison for `TreeSet(T)`.
- Make allocation behavior explicit and compatible with regions (`with`) and
  `--noheap`.
- Keep terminology and operation shapes close to C++ (`std::unordered_set` and
  `std::set`), adapted to Silk’s current method/optional model.

## Important Limitations (Current Compiler Subset)

In the current subset:

- `SetMap(T)` and `TreeSet(T)` store elements by value, but do not automatically
  run `Drop` for stored elements when entries are removed.
- These sets are intended for “plain” value types:
  - primitive scalars,
  - `string` views,
  - and small POD structs over those primitives.
- Avoid storing Drop-managed structs as set elements until the compiler has
  complete Drop integration for values stored inside container memory.

## Hash Set (`SetMap(T)`)

### Core API

`SetMap(T)` provides:

- `fn empty (hash: fn(T) -> u64, eq: fn(T, T) -> bool) -> SetMap(T);`
- `fn init (cap: i64, hash: fn(T) -> u64, eq: fn(T, T) -> bool) -> std::result::Result(SetMap(T), std::memory::AllocFailed);`
- `fn len (self: &SetMap(T)) -> i64;`
- `fn is_empty (self: &SetMap(T)) -> bool;`
- `fn capacity (self: &SetMap(T)) -> i64;`
- `fn contains (self: &SetMap(T), key: T) -> bool;`
- `fn insert (mut self: &SetMap(T), key: T) -> std::result::Result(bool, std::memory::OutOfMemory);`  
  Returns `true` when `key` was not already present.
- `fn remove (mut self: &SetMap(T), key: T) -> bool;`  
  Returns `true` when `key` was present and removed.
- `fn iter (self: &SetMap(T)) -> SetMapIter(T);`
- `fn clear (mut self: &SetMap(T)) -> void;`
- `fn reserve_additional (mut self: &SetMap(T), additional: i64) -> std::memory::OutOfMemory?;`
- `fn drop (mut self: &SetMap(T)) -> void;`

`SetMap.init(cap, ...)` validates the requested capacity:

- `cap < 0` returns `AllocErrorKind::InvalidInput`.
- very large `cap` values that would overflow internal sizing arithmetic return
  `AllocErrorKind::Overflow`.

Complexity expectations:

- average `O(1)` for `contains`/`insert`/`remove` when the hash distribution is good,
- worst case `O(n)` in adversarial collision patterns.

## Ordered Set (`TreeSet(T)`)

`TreeSet(T)` is an ordered set. It requires an ordering function.

### Core API

`TreeSet(T)` provides:

- `fn init (cmp: fn(T, T) -> int) -> TreeSet(T);`  
  Contract: `cmp(a, b) < 0` iff `a < b`; `cmp(a, b) == 0` iff keys are equal.
- `fn len (self: &TreeSet(T)) -> i64;`
- `fn is_empty (self: &TreeSet(T)) -> bool;`
- `fn contains (self: &TreeSet(T), key: T) -> bool;`
- `fn insert (mut self: &TreeSet(T), key: T) -> std::result::Result(bool, std::memory::OutOfMemory);`
- `fn remove (mut self: &TreeSet(T), key: T) -> bool;`
- `fn iter (self: &TreeSet(T)) -> TreeSetIter(T);`
- `fn clear (mut self: &TreeSet(T)) -> void;`
- `fn drop (mut self: &TreeSet(T)) -> void;`

Complexity expectations:

- `O(log n)` lookup/insert/remove.

## Iteration

Both sets provide iteration through an iterator interface:

- `SetMapIter(T)` implements `std::interfaces::Iterator(T)`.
- `TreeSetIter(T)` implements `std::interfaces::Iterator(T)`.

Notes:

- Iteration is by value (copies out each element).
- `SetMap` iteration order is unspecified.
- `TreeSet` iteration yields values in ascending order (as defined by `cmp`).
