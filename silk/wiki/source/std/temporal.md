# `std::temporal`

`std::temporal` provides `Instant`/`Duration` helpers and time-related
utilities.

Canonical doc: [temporal](?p=std/temporal).

## Example
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

- Canonical doc: [temporal](?p=std/temporal)
- Time types: [duration instant](?p=language/duration-instant)
