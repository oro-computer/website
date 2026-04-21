# `match`

`match` provides structured pattern matching.

Currently:

- `match <optional> { None => expr, Some(x) => expr }` is supported (expression form),
- `match <enum> { E::V => expr, ... }` is supported in a restricted exhaustive subset,
- typed-error handling uses a separate `match (expr) { ... }` statement form (see typed errors).

Canonical spec: [flow match](?p=language/flow-match).

## Notes

- Supported forms + tests: [flow match](?p=language/flow-match)

## Syntax

```silk
match value {
  Pattern => expr,
  Pattern => expr,
}
```

## Examples

### Example: matching an optional
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

### Example: matching an enum
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

- Canonical spec: [flow match](?p=language/flow-match)
- Enums: [enums](?p=language/enums)
- Typed errors (match statement): [typed errors](?p=language/typed-errors)
