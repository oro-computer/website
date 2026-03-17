# `std::formal`

`std::formal` provides reusable Formal Silk theories for common proof shapes:

- non-negative lengths and counters,
- non-null pointers,
- bounds checks,
- slice and vector well-formedness.

[Canonical doc](../docs/?p=std/formal).

## Importing

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";
```

## Example

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
#assure result == index;
fn checked_index (index: i64, len: i64) -> i64 {
  return index;
}
```

## Current theory set

- `nonnegative_i64`
- `nonnull_u64`
- `bounds_i64`
- `slice_well_formed`
- `vector_well_formed`

## See also

- [Canonical doc](../docs/?p=std/formal)
- Formal verification: [Formal verification (Formal Silk)](?p=language/formal-verification)
