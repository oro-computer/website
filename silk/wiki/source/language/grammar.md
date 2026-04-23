# Grammar

[grammar](?p=language/grammar) is the canonical “what the parser accepts” reference for Silk surface syntax.

This wiki page is a reading guide, not a replacement for the grammar itself.

## How to use the grammar

- Use the grammar when you need the exact token-level surface form.
- Use the linked language reference pages for semantics and type rules.
- Use the canonical docs and guides for runnable examples that exercise each construct.

## Example
```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s}", "world");
  return 0;
}
```

## See also

- Canonical grammar: [grammar](?p=language/grammar)
- Syntax tour: [syntax tour](?p=language/syntax-tour)
