---
layout: "docs"
title: "Flow Control Overview"
description: "Flow control describes how Silk programs sequence work, branch, loop, and exit. This concept spans several surface constructs and their static rules (typing, scoping, and diagnostics)."
docsCollection: "silk"
section: "language"
order: 13
sourcePath: "language/flow-overview.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Flow Control Overview

Flow control describes how Silk programs sequence work, branch, loop, and exit.
This concept spans several surface constructs and their static rules (typing,
scoping, and diagnostics).

## Core Constructs

- `if` / `else`
- [`loop`](/silk/wiki/language/flow-loop/) loops
- [`while`](/silk/wiki/language/flow-while/) loops
- `for` loops
- [`match`](/silk/wiki/language/flow-match/) expressions
- `return`
- `break`
- `continue`
- blocks and statement composition
- expression statements

Each construct has defined syntax, typing, and evaluation semantics which the
compiler must implement.

## Notes

Implemented end-to-end in the current compiler:

- `if` / `else` as statement forms ([flow if else](/silk/docs/language/flow-if-else/))
- [`loop`](/silk/wiki/language/flow-loop/) loops ([flow loop](/silk/docs/language/flow-loop/))
- [`while`](/silk/wiki/language/flow-while/) loops ([flow while](/silk/docs/language/flow-while/))
- `for` loops (ranges, builtin arrays/slices, and C-style `for (init; cond; step)`; [flow for](/silk/docs/language/flow-for/))
- `break` / `continue` inside loops ([flow break](/silk/docs/language/flow-break/),
 [flow continue](/silk/docs/language/flow-continue/))
- `return` statements, including “all paths must return” checking for non-`void`
 functions ([flow return](/silk/docs/language/flow-return/))
- [`match`](/silk/wiki/language/flow-match/) as an expression for optionals and enums ([flow match](/silk/docs/language/flow-match/))
- [`match`](/silk/wiki/language/flow-match/) as a statement for typed errors ([typed errors](/silk/docs/language/typed-errors/))
- Expression statements for calls and assignments only
 ([flow expression statements](/silk/docs/language/flow-expression-statements/))

Not implemented yet (design exists, but the current parser/checker do not
accept these end-to-end):

- `if` as a value-producing expression form

When in doubt, consult:

- [implementation status](/silk/docs/compiler/implementation-status/) (implementation snapshot)
- [diagnostics](/silk/docs/compiler/diagnostics/) (error codes)

## Principles

These rules help keep control flow explicit and statically checkable:

- Conditions are boolean: `if` and [`while`](/silk/wiki/language/flow-while/) require a `bool` condition (no
 integer “truthiness”).
- Bodies are blocks: flow constructs use `{ ... }` blocks as their bodies.
- Statements are terminated: most statement forms end with `;` (for example
 `let`, `return`, `break`, `continue`, `panic`, `assert`, and expression
 statements).

## Quick Examples

Branching:

```silk
fn main () -> int {
  let x: int = 1;
  if x == 0 {
    return 0;
  } else {
    return 1;
  }
}
```

Looping:

```silk
fn main () -> int {
  let mut i: int = 0;
  while i < 3 {
    i += 1;
  }
  return 0;
}
```

Matching:

```silk
fn main () -> int {
  let x: int? = Some(7);
  let y: int = match x {
    None => 0,
    Some(v) => v,
  };
  return y;
}
```

See the dedicated documents:

- [`flow-if-else.md`](/silk/docs/language/flow-if-else/)
- [`flow-loop.md`](/silk/docs/language/flow-loop/)
- [`flow-while.md`](/silk/docs/language/flow-while/)
- [`flow-for.md`](/silk/docs/language/flow-for/)
- [`flow-match.md`](/silk/docs/language/flow-match/)
- [`flow-return.md`](/silk/docs/language/flow-return/)
- [`flow-break.md`](/silk/docs/language/flow-break/)
- [`flow-continue.md`](/silk/docs/language/flow-continue/)
- [`flow-blocks-statements.md`](/silk/docs/language/flow-blocks-statements/)
- [`flow-expression-statements.md`](/silk/docs/language/flow-expression-statements/)
