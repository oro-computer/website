# Duration literals

Duration literals represent time spans with unit suffixes (`ms`, `s`, `min`,
etc) and produce a `Duration` value.

Canonical doc: `docs/language/literals-duration.md`.

## Example (Works today)

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

- Canonical doc: `docs/language/literals-duration.md`
- `Duration` and `Instant`: `docs/wiki/language/duration-instant.md`
