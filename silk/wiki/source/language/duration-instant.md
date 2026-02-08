# `Duration` and `Instant`

`Duration` represents a signed time span and `Instant` represents a signed
point-in-time on a monotonic timeline. The current backend subset treats both
as distinct Silk types that lower to `i64` nanoseconds.

Canonical doc: `docs/language/duration-instant.md`.

## Example (Works today): `Duration` arithmetic

```silk
fn main () -> int {
  let a: Duration = 10ms;
  let b: Duration = 2s;
  let c: Duration = a + b;
  if c > a {
    return 0;
  }
  return 1;
}
```

## See also

- Canonical doc: `docs/language/duration-instant.md`
- Duration literals: `docs/wiki/language/literals-duration.md`
- Temporal stdlib: `docs/std/temporal.md`
