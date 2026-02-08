# Refinement types (removed)

The earlier refinement-type design (types annotated with `where` predicates) is
removed.

Use Formal Silk instead:

- `#require` / `#assure` on functions,
- `#require` on `struct` declarations (struct requirements proved at
 construction sites).

See `docs/language/formal-verification.md`.
