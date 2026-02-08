# `while`

Use `while` for condition-controlled looping.

Canonical spec: `docs/language/flow-while.md`.

## Status

- Implemented subset + tests: `docs/language/flow-while.md`

## Syntax

```silk
while condition {
 // ...
}
```

## Example (Works today)

```silk
fn main () -> int {
 let mut i: int = 0;
 let mut sum: int = 0;

 while i < 3 {
 sum += i;
 i += 1;
 }

 return sum; // 0 + 1 + 2 = 3
}
```

## See also

- Canonical spec: `docs/language/flow-while.md`
- `break` / `continue`: `docs/wiki/language/flow-break.md`, `docs/wiki/language/flow-continue.md`
