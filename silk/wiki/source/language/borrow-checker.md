# Borrow checker (design)

Silk’s long-term design includes a borrow-checker-style static safety layer
over references and mutation. Today, the compiler enforces the explicit `mut`
borrow contract plus the current suspension-point restrictions documented in
the canonical borrow-checker docs.

[Canonical docs](../docs/?p=language/borrow-checker).

## What to use today

- Reach for [Mutability](?p=language/mutability) for the currently enforced
  `&T` / `mut &T` rules.
- Reach for the canonical
  [Borrow checker](../docs/?p=language/borrow-checker) page when you need the
  larger lifetime, aliasing, and `await`/`yield` model.

## Example: explicit mutable borrow
```silk
struct Counter {
  value: int,
}

fn inc (mut c: &Counter) -> void {
  c.value += 1;
}

fn main () -> int {
  let mut c: Counter = Counter{ value: 0 };
  inc(mut c);
  return c.value;
}
```

## See also

- [Mutability](?p=language/mutability)
- [Borrow checker](../docs/?p=language/borrow-checker)
