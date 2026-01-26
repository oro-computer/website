# Mutability (`mut`)

Silk is safe-by-default: bindings and borrows are immutable unless you opt in
to mutation.

Canonical spec: `docs/language/mutability.md`.

## Status

- Implemented subset + borrow rules: `docs/language/mutability.md`
- End-to-end support snapshot: `STATUS.md`

## Syntax

```silk
let mut x: int = 0;
x += 1;

// Two-part mut borrow contract:
// - parameter declared `mut`, and
// - call site uses `mut <expr>`.
// fn bump(mut p: &Pair) -> void { ... }
// bump(mut pair);
```

## Example (Works today): mutable local + mutable borrow

```silk
struct Pair {
  a: int,
  b: int,
}

fn bump_a (mut p: &Pair) -> void {
  p.a += 1;
}

fn main () -> int {
  let mut p: Pair = Pair{ a: 1, b: 2 };
  bump_a(mut p);
  return p.a;
}
```

## See also

- Canonical spec: `docs/language/mutability.md`
- Borrow-checker design notes: `docs/wiki/language/borrow-checker.md`
