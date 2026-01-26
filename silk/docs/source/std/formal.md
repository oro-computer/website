# `std::formal`

Status: **Implemented subset**. This module provides reusable Formal Silk theories
that encode common proof obligations (non-negativity, bounds checks, and basic
container invariants).

These theories are intended to:

- de-duplicate repetitive `#require` / `#assure` clauses across the standard
  library, and
- give downstream code a small set of “standard lemmas” for Z3-backed
  verification.

See `docs/language/formal-verification.md` for the Formal Silk model and
theory semantics.

## Importing and using theories

Theories are imported with named imports and applied via `#theory`:

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
fn get_at (index: i64, len: i64) -> i64 {
  return index;
}
```

## Initial theory set

The current `std::formal` module exports (at minimum) the following
theories:

- `nonnegative_i64(x: i64)` — proves/assumes `x >= 0`.
- `nonnull_u64(ptr: u64)` — proves/assumes `ptr != 0`.
- `bounds_i64(index: i64, len: i64)` — proves/assumes `0 <= index < len`.
- `slice_well_formed(ptr: u64, len: i64)` — proves/assumes:
  - `len >= 0`
  - `len == 0 || ptr != 0`
- `vector_well_formed(ptr: u64, len: i64, cap: i64)` — proves/assumes:
  - `len >= 0`
  - `cap >= 0`
  - `len <= cap`
  - `cap == 0 || ptr != 0`
