# `Duration` and `Instant`

`Duration` represents a signed time span and `Instant` represents a signed
point-in-time on a monotonic timeline. The current backend subset treats both
as distinct Silk types that lower to `i64` nanoseconds.

[Canonical doc](../docs/?p=language/duration-instant).

## Example: `Duration` arithmetic
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

- [Canonical doc](../docs/?p=language/duration-instant)
- Duration literals: [Duration literals](?p=language/literals-duration)
- Temporal stdlib: [std::temporal](../docs/?p=std/temporal)
