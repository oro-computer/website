# Optionals (`T?`)

Optionals represent “maybe a value” without sentinel `null`s.

- The nominal form is `Option(T)`.
- The idiomatic form is suffix `T?`.
- Values are `None` (empty) or `Some(value)` (present).
- Use `??` (coalescing), `?.` (optional field access), and `match` to consume
  optionals.

Canonical spec: `docs/language/optional.md`.

## Status

- Implemented subset + backend payload limits: `docs/language/optional.md`
- End-to-end support snapshot: `STATUS.md`

## Syntax (Selected)

```silk
let a: int? = None;
let b: int? = Some(123);

let x: int = b ?? 0;
let y: int = match b {
  None => 0,
  Some(v) => v,
};
```

## Examples

### Works today: `??` and `match`

```silk
fn main () -> int {
  let x: int? = Some(7);
  let y: int = x ?? 0;
  let z: int = match x {
    None => 1,
    Some(v) => v,
  };
  return y + z;
}
```

### Works today: optional struct field access with `?.`

```silk
struct Profile {
  email: string,
}

struct User {
  profile: Profile?,
}

fn main () -> int {
  let u: User = User{ profile: Some(Profile{ email: "a@b" }) };
  let email: string = u.profile?.email ?? "no-email";
  if email == "a@b" {
    return 0;
  }
  return 1;
}
```

## See also

- Canonical spec: `docs/language/optional.md`
- `match` expressions: `docs/language/flow-match.md`
- Optional-related fixtures: `tests/silk/pass_optional_*.slk`
