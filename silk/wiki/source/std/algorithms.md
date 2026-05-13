# `std::algorithms`

`std::algorithms` provides common algorithms over collections. Today, a small
Supported forms exists for scalar types.

Canonical doc: [algorithms](?p=std/algorithms).

## Importing

```silk
import algorithms from "std/algorithms";
```

## Example: `clamp_int`
```silk
import algorithms from "std/algorithms";

fn main () -> int {
  if algorithms::clamp_int(10, 0, 5) != 5 { return 1; }
  if algorithms::clamp_int(-1, 0, 5) != 0 { return 2; }
  return 0;
}
```

## See also

- Canonical doc: [algorithms](?p=std/algorithms)
