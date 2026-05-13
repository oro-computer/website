# `std::env`

`std::env` provides access to process environment variables and common
directory helpers.

Canonical doc: [env](?p=std/env).

## Example: `get`
```silk
import env from "std/env";
import { println } from "std/io";

fn main () -> int {
  let v_opt = env::get("HOME");
  match (v_opt) {
    Some(v) => println("HOME = {}", v),
    None => println("HOME is not set"),
  };
  return 0;
}
```

## See also

- Canonical doc: [env](?p=std/env)
- Typed errors: [typed errors](?p=language/typed-errors)
