---
layout: "docs"
description: "enum defines a nominal sum type with a fixed set of variants."
docsCollection: "silkWiki"
section: "language"
order: 32
sourcePath: "language/enums.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Enums

`enum` defines a nominal sum type with a fixed set of variants.

Currently, enums support:

- unit variants (`E::A`),
- tuple variants (`E::B(x)`),
- exhaustive [`match`](/silk/wiki/language/flow-match/) expressions over enum values (restricted subset; no guards),
- and statement-form ordinary enum [`match`](/silk/wiki/language/flow-match/) with qualified variant arms.

Full reference: [enums](/silk/wiki/language/enums/).

## Notes

- Supported forms + representation: [enums](/silk/wiki/language/enums/)

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

- Full reference: [enums](/silk/wiki/language/enums/)
- [`match`](/silk/wiki/language/flow-match/) expressions: [flow match](/silk/wiki/language/flow-match/)
