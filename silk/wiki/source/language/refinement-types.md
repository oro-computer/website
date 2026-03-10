# Refinement types (removed)

The earlier refinement-type design (types annotated with `where` predicates) is
removed.

Use Formal Silk instead:

- `#require` / `#assure` on functions,
- `#require` on `struct` declarations (struct requirements proved at
 construction sites).

Example:

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

See [Formal verification](../docs/?p=language/formal-verification).
