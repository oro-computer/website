# Refinement Types (Removed)

Silk previously had an experimental design for **refinement types** (types
annotated with logical predicates, often written with `where`).

That design has been removed in favor of a single mechanism: **Formal Silk**
(`#require`, `#assure`, `#assert`, loop invariants/variants, and `theory`), with
support for attaching `#require` directly to `struct` declarations.

## Replacement: Formal Silk struct requirements

Use `#require` on a `struct` to state requirements that must hold for all
values constructed for that struct type.

Example:

```silk
#require id > 0;
struct User {
  id: int,
}

#assure result > 0;
fn get_id () -> int {
  return 1;
}

fn main () -> int {
  let user = User{ id: get_id() };
  return user.id;
}
```

Rules (current subset):

- `#require` expressions on a `struct` may reference that struct's fields by
  name.
- When Formal Silk syntax is present in the compiled module set, the verifier
  proves these requirements at struct literal construction sites (`Type{ ... }`
  and `new Type{ ... }`). If any requirement cannot be proven, compilation
  fails.

See `docs/language/formal-verification.md`.
