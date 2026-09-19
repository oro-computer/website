---
layout: "docs"
description: "grammar is the canonical “what the parser accepts” reference for Silk surface syntax."
docsCollection: "silkWiki"
section: "language"
order: 14
sourcePath: "language/grammar.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Grammar

[grammar](/silk/wiki/language/grammar/) is the canonical “what the parser accepts” reference
for Silk surface syntax.

This wiki page is a reading guide, not a replacement for the grammar itself.

## How to use the grammar

- Use the grammar when you need the exact token-level surface form.
- Use the concept docs (`docs/language/*.md`) for semantics and type rules.
- Use the canonical docs for runnable examples.

## Example
```silk
import std::io;

fn main () -> int {
  std::io::println("hello {s}", "world");
  return 0;
}
```

## See also

- Canonical grammar: [grammar](/silk/wiki/language/grammar/)
- Syntax tour: [syntax tour](/silk/wiki/language/syntax-tour/)
