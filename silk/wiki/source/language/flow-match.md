# `match`

`match` provides structured pattern matching.

In the current implementation:

- `match <optional> { None => expr, Some(x) => expr }` is supported (expression form),
- `match <enum> { E::V => expr, ... }` is supported in a restricted exhaustive subset,
- typed-error handling uses a separate `match (expr) { ... }` statement form (see typed errors).

Canonical spec: `docs/language/flow-match.md`.

## Status

- Implemented subset + tests: `docs/language/flow-match.md`
- End-to-end support snapshot: `STATUS.md`

## Syntax (Current match-expression subset)

```silk
match value {
  Pattern => expr,
  Pattern => expr,
}
```

## Examples

### Works today: matching an optional

```silk
fn main () -> int {
  let x: int? = Some(7);
  let y: int = match x {
    None => 5,
    Some(v) => v,
  };
  return y;
}
```

### Works today: matching an enum

```silk
enum Msg {
  Quit,
  Add(int),
}

fn main () -> int {
  let m: Msg = Msg::Add(5);
  return match m {
    Msg::Quit => 0,
    Msg::Add(n) => n,
  };
}
```

## See also

- Canonical spec: `docs/language/flow-match.md`
- Enums: `docs/language/enums.md`
- Typed errors (match statement): `docs/language/typed-errors.md`
