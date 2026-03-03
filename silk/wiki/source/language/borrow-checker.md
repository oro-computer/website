# Borrow checker (design)

Silk’s long-term design includes a borrow-checker-style static safety layer
over references and mutation. The current compiler subset enforces a simpler,
explicit `mut` borrow contract (see mutability).

Canonical design doc: `docs/language/borrow-checker.md`.

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

- Mutability rules: `wiki/language/mutability.md`
- Canonical design doc: `docs/language/borrow-checker.md`
