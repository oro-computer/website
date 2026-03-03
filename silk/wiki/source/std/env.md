# `std::env`

`std::env` provides access to process environment variables and common
directory helpers.

Canonical doc: `docs/std/env.md`.

## Example: `get`

```silk
import std::env;
import { println } from "std/io";

fn main () -> int {
  let v_opt = std::env::get("HOME");
  match (v_opt) {
    Some(v) => println("HOME = {}", v),
    None => println("HOME is not set"),
  };
  return 0;
}
```

## See also

- Canonical doc: `docs/std/env.md`
- Typed errors: `wiki/language/typed-errors.md`
