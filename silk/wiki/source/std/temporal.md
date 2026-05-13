# `std::temporal`

`std::temporal` provides `Instant`/`Duration` helpers and time-related
utilities.

Canonical doc: [temporal](?p=std/temporal).

## Example
```silk
import temporal from "std/temporal";

fn main () -> int {
  let z: Duration = temporal::duration_zero();
  if !temporal::is_zero(z) { return 1; }
  if temporal::is_negative(1s) { return 2; }
  if !temporal::is_negative(-1s) { return 3; }
  return 0;
}
```

## See also

- Canonical doc: [temporal](?p=std/temporal)
- Time types: [duration instant](?p=language/duration-instant)
