# Borrow checker

Silk’s current borrow-checking story is a shipped subset plus a larger design.
Today the compiler already enforces lexical escape checks for slices and
borrowed references, mutable-alias checks at call sites, and conservative
restrictions across `task` / `await` boundaries.

[Canonical docs](../docs/?p=language/borrow-checker).

## Current subset

- Returning a borrow of a local binding is rejected.
- Returning a borrow of a parameter is allowed.
- Mutable aliasing in one call is rejected.
- `move` is rejected while a live borrow still exists.
- Crossing task boundaries with non-opaque `&T` values is rejected.

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
- [Concurrency](?p=language/concurrency)
