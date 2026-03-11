# Varargs (`...args`)

Silk supports “varargs” parameters to accept a variable number of trailing
arguments, used by `std::io::print` / `std::io::println`.

[Canonical doc](../docs/?p=language/varargs).

## Syntax

```silk
fn log (fmt: string, ...args: std::fmt::Arg) -> void {
  std::io::println(fmt, args);
}
```

## Example
```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=language/varargs)
- `std::fmt`: [std::fmt](?p=std/fmt)
