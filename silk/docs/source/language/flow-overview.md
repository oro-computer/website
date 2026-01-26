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

## Implementation Status (Current Compiler Subset)

Implemented end-to-end in the current compiler:

- `if` / `else` as statement forms (`docs/language/flow-if-else.md`)
- `loop` loops (`docs/language/flow-loop.md`)
- `while` loops (`docs/language/flow-while.md`)
- `for` loops (ranges, builtin arrays/slices, and C-style `for (init; cond; step)`; `docs/language/flow-for.md`)
- `break` / `continue` inside loops (`docs/language/flow-break.md`,
  `docs/language/flow-continue.md`)
- `return` statements, including “all paths must return” checking for non-`void`
  functions (`docs/language/flow-return.md`)
- `match` as an expression for optionals and enums (`docs/language/flow-match.md`)
- `match` as a statement for typed errors (`docs/language/typed-errors.md`)
- Expression statements for calls and assignments only
  (`docs/language/flow-expression-statements.md`)

Not implemented yet (design exists, but the current parser/checker do not
accept these end-to-end):

- `if` as a value-producing expression form

When in doubt, consult:

- `STATUS.md` (implementation snapshot)
- `docs/compiler/diagnostics.md` (error codes)
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
