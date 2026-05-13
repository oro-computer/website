# Grammar

[grammar](?p=language/grammar) is the canonical “what the parser accepts” reference
for Silk surface syntax.

This wiki page is a reading guide, not a replacement for the grammar itself.

## How to use the grammar

- Use the grammar when you need the exact token-level surface form.
- Use the concept docs (`docs/language/*.md`) for semantics and type rules.
- Use `tests/silk/pass_*.slk` for runnable examples.

## Example
```silk
import io from "std/io";

fn main () -> int {
  io::println("hello {s}", "world");
  return 0;
}
```

## See also

- Canonical grammar: [grammar](?p=language/grammar)
- Syntax tour: [syntax tour](?p=language/syntax-tour)
