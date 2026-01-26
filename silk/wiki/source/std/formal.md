# `std::formal`

`std::formal` provides reusable Formal Silk theories (“standard lemmas”) used
by stdlib code and downstream verified code.

Canonical doc: `docs/std/formal.md`.

## Status

- Implemented subset is available (initial theory set).
- Details: `docs/std/formal.md` and `STATUS.md`

## Importing

Theories are imported via file imports and applied with `#theory`:

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";
```

## Examples

### Works today: applying standard theories

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
fn get_at (index: i64, len: i64) -> i64 {
  return index;
}
```

## See also

- Canonical doc: `docs/std/formal.md`
- Formal verification: `docs/wiki/language/formal-verification.md`
