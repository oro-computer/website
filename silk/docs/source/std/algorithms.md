# `std::algorithms`

Status: **Design document**. This describes intended algorithm APIs; it is not
implemented yet.

`std::algorithms` provides common algorithms over collections (primarily
`std::arrays::Slice(T)` and related types).

See also:

- `docs/std/arrays.md`
- `docs/std/conventions.md`

## Implemented subset

A tiny, non-generic subset is implemented in `std/algorithms.slk` for early
bring-up. These helpers operate on concrete scalar types and are intended to be
replaced or complemented by generic slice/collection algorithms as soon as the
necessary language features exist.

```silk
module std::algorithms;

export fn min_int (a: int, b: int) -> int;
export fn max_int (a: int, b: int) -> int;
export fn clamp_int (x: int, lo: int, hi: int) -> int;

export fn min_u64 (a: u64, b: u64) -> u64;
export fn max_u64 (a: u64, b: u64) -> u64;
export fn clamp_u64 (x: u64, lo: u64, hi: u64) -> u64;

export fn min_f64 (a: f64, b: f64) -> f64;
export fn max_f64 (a: f64, b: f64) -> f64;
export fn clamp_f64 (x: f64, lo: f64, hi: f64) -> f64;

export fn abs_i64 (x: i64) -> i64;
export fn abs_int (x: int) -> int;
export fn abs_f64 (x: f64) -> f64;

export fn min_duration (a: Duration, b: Duration) -> Duration;
export fn max_duration (a: Duration, b: Duration) -> Duration;

export fn min_instant (a: Instant, b: Instant) -> Instant;
export fn max_instant (a: Instant, b: Instant) -> Instant;
```

## Scope

`std::algorithms` is responsible for:

- Searching, sorting, and transformation routines.
- Designed to work with `std::arrays` and other iterable types.

## Initial API Surface (Illustrative)

The initial algorithms target `Slice(T)` since it is the most universal view
type for contiguous collections.

```silk
module std::algorithms;

export fn linear_search (T, s: std::arrays::Slice(T), needle: T) -> int?;
export fn binary_search (T, s: std::arrays::Slice(T), needle: T, cmp: fn(T, T) -> int) -> int?;

export fn sort (T, s: std::arrays::Slice(T), cmp: fn(T, T) -> int) -> void;
export fn stable_sort (T, s: std::arrays::Slice(T), cmp: fn(T, T) -> int) -> void;

export fn min (T, s: std::arrays::Slice(T), cmp: fn(T, T) -> int) -> T?;
export fn max (T, s: std::arrays::Slice(T), cmp: fn(T, T) -> int) -> T?;
```

Notes:

- Sorting should be in-place where possible.
- Stable sorting may require temporary allocations; this should be explicit
  (accept an allocator) or clearly documented.

## Future Work

- `dedup`, `partition`, `reverse`, `rotate`, `shuffle`.
- Iterator-based algorithms once iterators and `for` are fully implemented.
