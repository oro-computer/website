# `match`

`match` provides structured pattern matching.

Currently:

- `match <optional> { None => expr, Some(x) => expr }` is supported (expression form),
- primitive-integer, enum, type-union, and `Result`-style expression matches are supported in the documented subset,
- ordinary value matching and typed-error handling use a separate statement form `match (expr) { ... }`,
- guarded arms (`pattern if cond => ...`) are still unsupported in both expression and statement form,
- enum wildcard `_` remains a split case:
  - expression-form enum matches do not accept `_`,
  - statement-form ordinary enum matches reserve `_`, but the backend still requires explicit variant coverage end to end.

Canonical spec: `docs/language/flow-match.md`.

## Reference

- Canonical spec and current behavior: `docs/language/flow-match.md`

## Syntax

```silk
match value {
  Pattern => expr,
  Pattern => expr,
}
```

```silk
match (value) {
  Pattern => { ... },
  Pattern => { ... },
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

### Example: matching a result
```silk
import std::result;

fn main () -> int {
  let r: std::result::Result(int, int) = std::result::Result(int, int).ok(7);
  return match r {
    Ok(v) => v,
    Err(_) => 0,
  };
}
```

## See also

- Canonical spec: `docs/language/flow-match.md`
- Enums: `docs/language/enums.md`
- Typed errors (match statement): `docs/language/typed-errors.md`
