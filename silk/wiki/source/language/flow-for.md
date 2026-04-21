# `for` loops

`for` loops iterate over:

- integer ranges (`start..end` / `start..=end`),
- builtin arrays and slices (`for x in xs { ... }`),
- iterator values (`for x in it { ... }` when `it.next() -> T?`),
- and C-style headers (`for (init; cond; step) { ... }`).

Canonical spec: [flow for](?p=language/flow-for).

## Notes

- Supported forms + current limitations: [flow for](?p=language/flow-for)

## Syntax
```silk
for x in xs {
  // ...
}

for (let i = 0; i < 10; ++i) {
  // ...
}
```

## Examples

### Example: range iteration
```silk
fn main () -> int {
  let mut sum: int = 0;
  for i in 0..3 {
    sum += i; // 0, 1, 2
  }
  return sum;
}
```

### Example: array iteration
```silk
fn main () -> int {
  let xs: int[3] = [1, 2, 3];
  let mut sum: int = 0;
  for x in xs {
    sum += x;
  }
  return sum;
}
```

## See also

- Canonical spec: [flow for](?p=language/flow-for)
- Iterator protocol (Supported forms): [interfaces](?p=std/interfaces)
