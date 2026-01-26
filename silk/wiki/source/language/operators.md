# Operators

Silk’s operators cover arithmetic, comparisons, logical operators, assignment,
casts, ranges, optionals (`?.`, `??`), and typed-error propagation (`?`).

This wiki page is a learning-oriented companion to the canonical reference:
`docs/language/operators.md`.

## Status

- Full operator set + precedence: `docs/language/operators.md`
- Implemented-subset notes: `STATUS.md`

## Syntax (Selected)

```silk
let a: int = 10;
let b: int = 3;

let sum: int = a + b;
let cmp: bool = a >= b;

// Optional chaining and coalescing
// let email: string = user.profile?.email ?? "no-email";

// Casts
let x: u64 = 123 as u64;

// Typed-error propagation
// let value: T = may_panic()?;
```

## Examples

### Works today: arithmetic + comparisons

```silk
fn main () -> int {
  let a: int = 10;
  let b: int = 3;
  if a % b == 1 {
    return a + b; // 13
  }
  return 0;
}
```

### Works today: `??` coalescing

```silk
fn main () -> int {
  let x: int? = None;
  return x ?? 42;
}
```

## See also

- Canonical reference: `docs/language/operators.md`
- Optionals: `docs/language/optional.md`
- Typed errors and `?`: `docs/language/typed-errors.md`
