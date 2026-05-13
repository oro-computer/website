# Duration literals

Duration literals represent time spans with unit suffixes (`ms`, `s`, `min`,
etc) and produce a `Duration` value.

Reference: [duration literals](../docs/?p=language/literals-duration).

## Units

Duration literals are numeric values followed immediately by a unit:

- `ns` nanoseconds
- `us` microseconds
- `ms` milliseconds
- `s` seconds
- `min` minutes
- `h` hours
- `d` days

```silk
let debounce: Duration = 250ms;
let timeout: Duration = 5s;
let interval: Duration = 1min;
```

The suffix is part of the literal token, so `10 ms` is not the same as `10ms`.

## Example

```silk
fn main () -> int {
  let a: Duration = 10ms;
  let b: Duration = 2s;
  let c: Duration = a + b;
  if c > a { return 0; }
  return 1;
}
```

## Instant vs Duration

`Duration` is a span of time. `Instant` is a point in time. You normally use
durations for configuration and arithmetic, and instants for measuring elapsed
time.

```silk
fn should_retry (elapsed: Duration) -> bool {
  return elapsed >= 500ms;
}
```

## Pitfalls

- Prefer explicit units at call sites; `500ms` is clearer than a bare integer.
- Watch for overflow when very large values are scaled to nanoseconds.
- Use `Duration` values for time spans instead of encoding milliseconds in
 ordinary `int` fields.

## See also

- Reference: [duration literals](../docs/?p=language/literals-duration)
- `Duration` and `Instant`: [duration instant](?p=language/duration-instant)
- Types: [types](?p=language/types)
