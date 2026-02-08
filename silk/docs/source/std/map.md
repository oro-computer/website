# `std::map` — Maps and Dictionaries

`std::map` provides the standard associative container surfaces:

- `HashMap(K, V)` — an unordered map backed by a hash table.
- `TreeMap(K, V)` — an ordered map backed by a red-black tree.

Status: **initial implementation**. The API is specified here; it
targets the current compiler/backend subset and will grow as the language gains
first-class move/Drop semantics for values stored inside heap-backed data
structures.

## Design Goals

- Provide a consistent, ergonomic key→value container story in `std::` without
  relying on a builtin `map(K, V)` type form.
- Make allocation behavior explicit and compatible with regions (`with`) and
  `--noheap`.
- Keep the API close in spirit to C++’s `std::unordered_map` and `std::map`
  (operations, complexity expectations, and terminology), adapted to Silk.

## Important Limitations (Current Compiler Subset)

In the current subset:

- `HashMap(K, V)` and `TreeMap(K, V)` store keys and values by value, but do not
  automatically run `Drop` for stored keys/values when entries are overwritten
  or removed.
- `HashMap(K, V)` stores keys and values in the compiler’s **scalar-slot**
  layout (`sizeof(K)` / `sizeof(V)` bytes, multiples of 8 in the current
  subset). This supports multi-slot value types such as `string` and non-opaque
  structs/enums over supported primitives.
- `TreeMap(K, V)` is still limited by its current node layout and, for now,
  should be treated as **single-slot** storage (keys/values that lower to a
  single `u64` slot).
- These containers are intended for “plain” value types:
  - primitive scalars,
  - `string` views,
  - and small POD structs over those primitives.
- Avoid storing refcounted `&Struct` heap references or owned Drop-managed
  structs (for example `std::strings::String`) as keys/values until the
  compiler has complete Drop integration for values stored inside container
  memory.

These limits are expected to be relaxed as the compiler grows a complete memory
model for container element drops.

## HashMap (`HashMap(K, V)`)

### Construction

`HashMap` requires user-supplied hashing and equality functions (similar in
spirit to the `Hash` and `KeyEqual` customization points of C++
`std::unordered_map`).

For common key types, `std::map` provides default `hash_*` / `eq_*` helpers so
callers do not need to write hashing and equality functions themselves.

Default helper functions are provided for these key types:

- `bool`
- fixed-width integers (`u8`/`i8`/`u16`/`i16`/`u32`/`i32`/`u64`/`i64`/`u128`/`i128`)
- platform integers (`int`, `usize`, `size`/`isize`)
- `char`
- `string` (bytewise FNV-1a)

Example (using `std::map` defaults):

```silk
import std::map;
import std::result;
import std::memory;

type Map = std::map::HashMap(u64, int);
type InitResult = std::result::Result(Map, std::memory::AllocFailed);

fn main () -> int {
  let init_r: InitResult = Map.init(16, std::map::hash_u64, std::map::eq_u64);
  if init_r.is_err() { return 1; }
  let mut m: Map = match (init_r) {
    InitResult::Ok(v) => v,
    InitResult::Err(_) => Map.empty(std::map::hash_u64, std::map::eq_u64),
  };
  let put_r = (mut m).put(1, 10);
  if put_r.is_err() { (mut m).drop(); return 2; }

  let v: int = m.get(1) ?? 0;
  (mut m).drop();
  return v;
}
```

Example (custom hashing/equality):

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
  if init_r.is_err() { return 1; }
  let mut m: Map = match (init_r) {
    InitResult::Ok(v) => v,
    InitResult::Err(_) => Map.empty(hash_u64, eq_u64),
  };
  (mut m).drop();
  return 0;
}
```

`HashMap.init(cap, ...)` validates the requested capacity:

- `cap < 0` returns `AllocErrorKind::InvalidInput`.
- very large `cap` values that would overflow internal sizing arithmetic return
  `AllocErrorKind::Overflow`.

### Core API

`HashMap(K, V)` provides:

- `fn empty (hash: fn(K) -> u64, eq: fn(K, K) -> bool) -> HashMap(K, V);`
- `fn init (cap: i64, hash: fn(K) -> u64, eq: fn(K, K) -> bool) -> std::result::Result(HashMap(K, V), std::memory::AllocFailed);`
- `fn len (self: &HashMap(K, V)) -> i64;`
- `fn is_empty (self: &HashMap(K, V)) -> bool;`
- `fn capacity (self: &HashMap(K, V)) -> i64;`
- `fn contains_key (self: &HashMap(K, V), key: K) -> bool;`
- `fn get (self: &HashMap(K, V), key: K) -> V?;`
- `fn put (mut self: &HashMap(K, V), key: K, value: V) -> std::result::Result(V?, std::memory::OutOfMemory);`  
  Inserts or replaces and returns the previous value, if present.
- `fn remove (mut self: &HashMap(K, V), key: K) -> V?;`
- `fn iter (self: &HashMap(K, V)) -> HashMapIter(K, V);`
- `fn clear (mut self: &HashMap(K, V)) -> void;`
- `fn reserve_additional (mut self: &HashMap(K, V), additional: i64) -> std::memory::OutOfMemory?;`
- `fn drop (mut self: &HashMap(K, V)) -> void;`  
  Releases the table backing memory.

Complexity expectations:

- average `O(1)` for `get`/`put`/`remove` when the hash distribution is good,
- worst case `O(n)` in adversarial collision patterns.

## TreeMap (`TreeMap(K, V)`)

`TreeMap` is an ordered map. It requires an ordering function.

### Core API

`TreeMap(K, V)` provides:

- `fn init (cmp: fn(K, K) -> int) -> TreeMap(K, V);`  
  Contract: `cmp(a, b) < 0` iff `a < b`; `cmp(a, b) == 0` iff keys are equal.
- `fn len (self: &TreeMap(K, V)) -> i64;`
- `fn is_empty (self: &TreeMap(K, V)) -> bool;`
- `fn contains_key (self: &TreeMap(K, V), key: K) -> bool;`
- `fn get (self: &TreeMap(K, V), key: K) -> V?;`
- `fn put (mut self: &TreeMap(K, V), key: K, value: V) -> std::result::Result(V?, std::memory::OutOfMemory);`
- `fn remove (mut self: &TreeMap(K, V), key: K) -> V?;`
- `fn iter (self: &TreeMap(K, V)) -> TreeMapIter(K, V);`
- `fn clear (mut self: &TreeMap(K, V)) -> void;`
- `fn drop (mut self: &TreeMap(K, V)) -> void;`

Complexity expectations:

- `O(log n)` lookup/insert/remove.

## Iteration

Both maps provide iteration through an iterator interface:

- `HashMapIter(K, V)` implements `std::interfaces::Iterator(Entry(K, V))`.
- `TreeMapIter(K, V)` implements `std::interfaces::Iterator(Entry(K, V))`.

The produced item type is:

```silk
struct Entry(K, V) {
  key: K,
  value: V,
}
```

Notes:

- Iteration is by value (copies out `key` and `value`).
- `HashMap` iteration order is unspecified.
- `TreeMap` iteration yields entries in ascending key order (as defined by `cmp`).
