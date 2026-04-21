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

Each construct has defined syntax, typing, and evaluation semantics.

## Supported forms

Includes:

- `if` / `else` as statement forms ([flow if else](?p=language/flow-if-else))
- `loop` loops ([flow loop](?p=language/flow-loop))
- `while` loops ([flow while](?p=language/flow-while))
- `for` loops (ranges, builtin arrays/slices, and C-style `for (init; cond; step)`; [flow for](?p=language/flow-for))
- `break` / `continue` inside loops ([flow break](?p=language/flow-break),
 [flow continue](?p=language/flow-continue))
- `return` statements, including “all paths must return” checking for non-`void`
 functions ([flow return](?p=language/flow-return))
- `match` as an expression for optionals, primitive integers, enums, type
 unions, and recoverable `Result`-style values
 ([flow match](?p=language/flow-match))
- `match` as a statement for ordinary values in the supported subset and for
 typed errors ([flow match](?p=language/flow-match),
 [typed errors](?p=language/typed-errors))
- Expression statements for calls and assignments only
 ([flow expression statements](?p=language/flow-expression-statements))

Additional notes:

- `if` as a value-producing expression form is implemented for the documented
 subset; see [flow if else](?p=language/flow-if-else).

When in doubt, consult:

- [diagnostics](?p=compiler/diagnostics) (error codes)
- the runnable examples embedded throughout `docs/language/`

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
