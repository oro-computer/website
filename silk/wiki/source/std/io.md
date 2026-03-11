# `std::io`

`std::io` provides basic stdin/stdout/stderr I/O and a small formatting surface
(`print` / `println`).

[Canonical doc](../docs/?p=std/io).

## Status

- Basic reads/writes, formatted stdout/stderr helpers, `std::io::async`, and
  task-based `std::io::stream` adapters exist today.
- Buffered I/O and broader fully async file/stream coverage are still
  incomplete; use the canonical doc for the precise current subset.

## Importing

```silk
import std::io;
```

## Examples

### Example: formatted printing
```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/io)
- [Format strings](../docs/?p=std/fmt)
- [Runtime backend](?p=std/runtime)
