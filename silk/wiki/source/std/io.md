# `std::io`

`std::io` provides basic stdin/stdout/stderr I/O and a small formatting surface
(`print`/`println`).

Full reference: `docs/std/io.md`.

## Notes

- Full reference: `docs/std/io.md`

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

- Canonical doc: `docs/std/io.md`
- Format strings: `docs/std/fmt.md`
- Runtime backend: `docs/std/runtime.md`
