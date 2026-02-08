# `std::temporal`

`std::temporal` provides `Instant`/`Duration` helpers and time-related
utilities.

Canonical doc: `docs/std/temporal.md`.

## Example (Works today)

```silk
import std::temporal;

fn main () -> int {
 let z: Duration = std::temporal::duration_zero();
 if !std::temporal::is_zero(z) { return 1; }
 if std::temporal::is_negative(1s) { return 2; }
 if !std::temporal::is_negative(-1s) { return 3; }
 return 0;
}
```

## See also

- Canonical doc: `docs/std/temporal.md`
- Time types: `docs/wiki/language/duration-instant.md`
