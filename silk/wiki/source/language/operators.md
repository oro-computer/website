# Operators

Silk’s operators cover arithmetic, comparisons, logical operators, assignment,
casts, ranges, optionals (`?.`, `??`), and typed-error propagation (`?`).

This wiki page is a learning-oriented companion to the canonical reference:
[Operators](../docs/?p=language/operators).

## Status

- Full operator set + precedence: [Operators](../docs/?p=language/operators)

## Syntax
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

### Example: arithmetic + comparisons
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

### Example: `??` coalescing
```silk
fn main () -> int {
  let x: int? = None;
  return x ?? 42;
}
```

## See also

- Canonical reference: [Operators](../docs/?p=language/operators)
- Optionals: [Optional](../docs/?p=language/optional)
- Typed errors and `?`: [Typed Errors (error, panic, and T | ErrorType...)](../docs/?p=language/typed-errors)
