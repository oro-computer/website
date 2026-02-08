# Struct Requirements (`#require`)

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
  // This fails verification:
  // let bad = User{ id: 0 };

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
