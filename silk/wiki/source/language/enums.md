# Enums

`enum` defines a nominal sum type with a fixed set of variants.

Currently, enums support:

- unit variants (`E::A`),
- tuple variants (`E::B(x)`),
- exhaustive expression-form `match` over enum values with explicit variant coverage,
- no guarded arms (`if ...`) in either expression or statement form,
- and statement-form ordinary enum `match` with qualified variant arms and explicit end-to-end variant coverage.

Canonical spec: `docs/language/enums.md`.

## Reference

- Canonical spec and current behavior: `docs/language/enums.md`

## Syntax
```silk
enum Msg {
  Quit,
  Add(int),
}
```

## Examples

### Example: construct + match
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

- Canonical spec: `docs/language/enums.md`
- `match` expressions: `docs/language/flow-match.md`
- Enum fixtures: `tests/silk/pass_enum_*`
