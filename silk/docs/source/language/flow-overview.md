# Flow Control Overview

Flow control describes how Silk programs sequence work, branch, loop, and exit.
This concept spans several surface constructs and their static rules (typing,
scoping, and diagnostics).

## Core Constructs

- `if` / `else`
- `loop` loops
- `while` loops
- `for` loops
- `match` expressions
- `return`
- `break`
- `continue`
- blocks and statement composition
- expression statements

Each construct has defined syntax, typing, and evaluation semantics which the
compiler must implement.

## Notes

Implemented end-to-end in the current compiler:

- `if` / `else` as statement forms ([flow if else](?p=language/flow-if-else))
- `loop` loops ([flow loop](?p=language/flow-loop))
- `while` loops ([flow while](?p=language/flow-while))
- `for` loops (ranges, builtin arrays/slices, and C-style `for (init; cond; step)`; [flow for](?p=language/flow-for))
- `break` / `continue` inside loops ([flow break](?p=language/flow-break),
 [flow continue](?p=language/flow-continue))
- `return` statements, including “all paths must return” checking for non-`void`
 functions ([flow return](?p=language/flow-return))
- `match` as an expression for optionals and enums ([flow match](?p=language/flow-match))
- `match` as a statement for typed errors ([typed errors](?p=language/typed-errors))
- Expression statements for calls and assignments only
 ([flow expression statements](?p=language/flow-expression-statements))

Not implemented yet (design exists, but the current parser/checker do not
accept these end-to-end):

- `if` as a value-producing expression form

When in doubt, consult:

- [implementation status](?p=compiler/implementation-status) (implementation snapshot)
- [diagnostics](?p=compiler/diagnostics) (error codes)
- `tests/silk/pass_*.slk` (working examples)

## Principles

These rules help keep control flow explicit and statically checkable:

- Conditions are boolean: `if` and `while` require a `bool` condition (no
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

- `flow-if-else.md`
- `flow-loop.md`
- `flow-while.md`
- `flow-for.md`
- `flow-match.md`
- `flow-return.md`
- `flow-break.md`
- `flow-continue.md`
- `flow-blocks-statements.md`
- `flow-expression-statements.md`
