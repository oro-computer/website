# Enums

`enum` defines a nominal sum type with a fixed set of variants.

Currently, enums support:

- unit variants (`E::A`),
- tuple variants (`E::B(x)`),
- exhaustive `match` expressions over enum values (restricted subset; no guards).

Canonical spec: `docs/language/enums.md`.

## Status

- Implemented subset + representation: `docs/language/enums.md`
- End-to-end support snapshot: `STATUS.md`

## Syntax (Selected)

```silk
enum Msg {
  Quit,
  Add(int),
}
```

## Examples

### Works today: construct + match

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
