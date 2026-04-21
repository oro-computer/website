# Duration literals

Duration literals represent time spans with unit suffixes (`ms`, `s`, `min`,
etc) and produce a `Duration` value.

Canonical doc: [literals duration](?p=language/literals-duration).

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

## See also

- Canonical doc: [literals duration](?p=language/literals-duration)
- `Duration` and `Instant`: [duration instant](?p=language/duration-instant)
