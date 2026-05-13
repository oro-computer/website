# `std::io`

`std::io` provides basic stdin/stdout/stderr I/O and a small formatting surface
(`print`/`println`).

Canonical doc: [io](?p=std/io).

## Notes

- Design + implementation: basic reads/writes are implemented via `std::runtime::io`.
- Details: [io](?p=std/io)

## Importing

```silk
import io from "std/io";
```

## Examples

### Example: formatted printing
```silk
import io from "std/io";

fn main () -> int {
  io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

## See also

- Canonical doc: [io](?p=std/io)
- Format strings: [fmt](?p=std/fmt)
- Runtime backend: [runtime](?p=std/runtime)
