# Varargs (`...args`)

Silk supports “varargs” parameters to accept a variable number of trailing
arguments, used by `io::print` / `io::println`.

Canonical doc: [varargs](?p=language/varargs).

## Syntax

```silk
fn log (fmt: string, ...args: fmt::Arg) -> void {
  io::println(fmt, args);
}
```

## Example
```silk
import io from "std/io";

fn main () -> int {
  io::println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

## See also

- Canonical doc: [varargs](?p=language/varargs)
- `fmt`: [fmt](?p=std/fmt)
