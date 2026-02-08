# `std::algorithms`

`std::algorithms` provides common algorithms over collections. Today, a small
current subset exists for scalar types.

Canonical doc: `docs/std/algorithms.md`.

## Importing

```silk
import std::algorithms;
```

## Example (Works today): `clamp_int`

```silk
import std::algorithms;

fn main () -> int {
 if std::algorithms::clamp_int(10, 0, 5) != 5 { return 1; }
 if std::algorithms::clamp_int(-1, 0, 5) != 0 { return 2; }
 return 0;
}
```

## See also

- Canonical doc: `docs/std/algorithms.md`
