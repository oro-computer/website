# `std::fmt`

`std::fmt` defines the formatting model used by `std::io::print`/`println`
by string-building helpers. It follows a Zig-`std.fmt`-style format-string
syntax.

Canonical doc: [fmt](?p=std/fmt).

## Notes

- Supported forms is available to support `std::io` printing.
- Details: [fmt](?p=std/fmt)

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

- Canonical doc: [fmt](?p=std/fmt)
- Printing: [io](?p=std/io)
