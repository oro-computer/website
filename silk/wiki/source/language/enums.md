# Enums

`enum` defines a nominal sum type with a fixed set of variants.

Currently, enums support:

- unit variants (`E::A`),
- tuple variants (`E::B(x)`),
- exhaustive `match` expressions over enum values (restricted subset; no guards).

[Canonical spec](../docs/?p=language/enums).

## Status

- Implemented subset + representation: [enum Types](../docs/?p=language/enums)

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

- [Canonical spec](../docs/?p=language/enums)
- `match` expressions: [match Expression (and Statement)](../docs/?p=language/flow-match)
- Syntax tour: [Silk Syntax Tour (Soup to Nuts)](../docs/?p=language/syntax-tour)
