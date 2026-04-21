# Enums

`enum` defines a nominal sum type with a fixed set of variants.

Currently, enums support:

- unit variants (`E::A`),
- tuple variants (`E::B(x)`),
- exhaustive `match` expressions over enum values (restricted subset; no guards),
- and statement-form ordinary enum `match` with qualified variant arms.

Canonical spec: [enums](?p=language/enums).

## Notes

- Supported forms + representation: [enums](?p=language/enums)

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

- Canonical spec: [enums](?p=language/enums)
- `match` expressions: [flow match](?p=language/flow-match)
- Enum fixtures: `tests/silk/pass_enum_*`
