# Borrow checker

Silk ships a borrow-checker-style static safety layer over references,
borrows, and lexical escape rules.

Canonical doc: [`/silk/docs/?p=language/borrow-checker`](/silk/docs/?p=language/borrow-checker).

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

- Mutability rules: [`/silk/wiki/?p=language/mutability`](/silk/wiki/?p=language/mutability)
- Canonical doc: [`/silk/docs/?p=language/borrow-checker`](/silk/docs/?p=language/borrow-checker)
