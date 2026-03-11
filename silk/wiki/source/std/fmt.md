# `std::fmt`

`std::fmt` defines the formatting model used by `std::io::print`/`println`
by string-building helpers. It follows a Zig-`std.fmt`-style format-string
syntax.

[Canonical doc](../docs/?p=std/fmt).

## Status

- Implemented subset is available to support `std::io` printing.
- [Details](../docs/?p=std/fmt)

## Examples

### Example: `println` formatting
```silk
import std::io;

fn main () -> int {
  std::io::println("name={s} ok={}", "silk", true);
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/fmt)
- Printing: [std::io](../docs/?p=std/io)
