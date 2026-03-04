# Grammar

`docs/language/grammar.md` is the canonical “what the parser accepts” reference
for Silk surface syntax.

This wiki page is a reading guide, not a replacement for the grammar itself.

## How to use the grammar

- Use the grammar when you need the exact token-level surface form.
- Use the concept docs (`docs/language/*.md`) for semantics and type rules.
- Use the runnable examples embedded throughout the docs for working reference programs.

## Example

```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s}", "world");
  return 0;
}
```

## See also

- Canonical grammar: `docs/language/grammar.md`
- Syntax tour: `wiki/language/syntax-tour.md`
