---
layout: "docs"
title: "Errors and assertions"
description: "Silk favors explicit, typed error modeling (optionals and Result-style return shapes) and uses typed errors (error, panic, T | ErrorType...) for unrecoverable logic bugs and contract violations."
docsCollection: "silkWiki"
section: "language"
order: 33
sourcePath: "language/errors.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Errors and assertions

Silk favors explicit, typed error modeling (optionals and `Result`-style return
shapes) and uses typed errors (`error`, `panic`, `T | ErrorType...`) for
unrecoverable logic bugs and contract violations.

This page focuses on assertions and the high-level model; see typed errors for
the full rules.

Full reference: [errors](/silk/wiki/language/errors/).

## Example: `assert`
```silk
fn main () -> int {
  assert (1 + 2) == 3;
  return 0;
}
```

## See also

- Full reference: [errors](/silk/wiki/language/errors/)
- Typed errors: [typed errors](/silk/wiki/language/typed-errors/)
- `Result(T, E)`: [result](/silk/wiki/std/result/)
