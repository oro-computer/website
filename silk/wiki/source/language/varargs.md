# Varargs (`...args`)

Silk supports “varargs” parameters to accept a variable number of trailing
arguments, used by `std::io::print` / `std::io::println`.

Canonical doc: `docs/language/varargs.md`.

## Syntax

```silk
fn log (fmt: string, ...args: std::fmt::Arg) -> void {
  std::io::println(fmt, args);
}
```

## Example (Works today)

```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

## See also

- Canonical doc: `docs/language/varargs.md`
- `std::fmt`: `docs/wiki/std/fmt.md`
