# Optionals (`T?`)

Optionals represent “maybe a value” without sentinel `null`s.

- The nominal form is `Option(T)`.
- The idiomatic form is suffix `T?`.
- Values are `None` (empty) or `Some(value)` (present).
- Use `??` (coalescing), `?.` (optional field access), and `match` to consume
  optionals.

[Canonical spec](../docs/?p=language/optional).

## Status

- Implemented subset + backend payload limits: [Optional](../docs/?p=language/optional)

## Syntax
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

### Example: `??` and `match`
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

### Example: optional struct field access with `?.`
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

- [Canonical spec](../docs/?p=language/optional)
- `match` expressions: [match Expression (and Statement)](../docs/?p=language/flow-match)
- Syntax tour: [Silk Syntax Tour (Soup to Nuts)](../docs/?p=language/syntax-tour)
