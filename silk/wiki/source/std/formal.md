# `std::formal`

`std::formal` provides reusable Formal Silk theories (“standard lemmas”) used
by stdlib code and downstream verified code.

[Canonical doc](../docs/?p=std/formal).

## Status

- Implemented subset is available (initial theory set).
- [Details](../docs/?p=std/formal)

## Importing

Theories are imported via file imports and applied with `#theory`:

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";
```

## Examples

### Example: applying standard theories
```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
fn get_at (index: i64, len: i64) -> i64 {
  return index;
}
```

## See also

- [Canonical doc](../docs/?p=std/formal)
- Formal verification: [Formal verification (Formal Silk)](?p=language/formal-verification)
