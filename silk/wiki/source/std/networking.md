# `std::net`

`std::net` provides networking primitives (hosted POSIX baseline).

Canonical doc: `docs/std/networking.md`.

## Example (Works today): IPv4 helpers

```silk
import std::net;

fn main () -> int {
  let a = ipv4(127, 0, 0, 1);
  if !ipv4_is_loopback(a) { return 1; }
  return 0;
}
```

## See also

- Canonical doc: `docs/std/networking.md`
