# `std::fmt`

`std::fmt` defines the formatting model used by `std::io::print`/`println`
by string-building helpers. It follows a Zig-`std.fmt`-style format-string
syntax.

Canonical doc: `docs/std/fmt.md`.

## Status

- Implemented subset is available to support `std::io` printing.
- Details: `docs/std/fmt.md`

## Examples

### Works today: `println` formatting

```silk
import std::io;

fn main () -> int {
  std::io::println("name={s} ok={}", "silk", true);
  return 0;
}
```

## See also

- Canonical doc: `docs/std/fmt.md`
- Printing: `docs/std/io.md`
