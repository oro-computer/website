# Mutability (`mut`)

Silk is safe-by-default: bindings and borrows are immutable unless you opt in
to mutation.

Canonical spec: [mutability](?p=language/mutability).

## Notes

- Supported forms + borrow rules: [mutability](?p=language/mutability)

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

## Example: mutable local + mutable borrow
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

- Canonical spec: [mutability](?p=language/mutability)
- Borrow-checker design notes: [borrow checker](?p=language/borrow-checker)
