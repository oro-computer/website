# Borrow checker (design)

Silk’s long-term design includes a borrow-checker-style static safety layer
over references and mutation. Silk currently enforces a simpler,
explicit `mut` borrow contract (see mutability).

Canonical design doc: [borrow checker](?p=language/borrow-checker).

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

- Mutability rules: [mutability](?p=language/mutability)
- Canonical design doc: [borrow checker](?p=language/borrow-checker)
