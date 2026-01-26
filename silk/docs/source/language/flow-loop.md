# `loop` Loop

The `loop` statement executes a block repeatedly until it is terminated by a
`break` or `return`.

Status: **Implemented subset**: `loop { ... }`, plus `async loop { ... }` and
`task loop { ... }`.

## Surface Syntax

```silk
loop {
  // ...
}
```

```silk
async loop {
  // ...
}
```

```silk
task loop {
  // ...
}
```

Notes:

- `async loop` and `task loop` are still loop statements: they do not end with
  `;`.
- In the current compiler subset, `async loop` / `task loop` follow the same
  async-context restriction as `async { ... }` / `task { ... }`:
  they are only allowed inside functions declared with `async`
  (`docs/compiler/diagnostics.md`, `E2031`).

## Semantics

- The body block executes repeatedly.
- `break;` exits the nearest enclosing loop and continues execution at the
  statement immediately following the loop (`docs/language/flow-break.md`).
- `continue;` skips the remainder of the current iteration’s body and begins the
  next iteration (`docs/language/flow-continue.md`).
- `return;` exits the current function (`docs/language/flow-return.md`).

## Type Checking Rules

- The loop body is checked in a loop context so `break` / `continue` are valid.
- `break;` outside a loop is rejected (`docs/compiler/diagnostics.md`, `E2007`).
- `continue;` outside a loop is rejected (`docs/compiler/diagnostics.md`, `E2008`).

## Implementation Status (Current Compiler Subset)

Implemented end-to-end:

- `loop { ... }`, `async loop { ... }`, and `task loop { ... }` parse, type-check,
  and lower with correct `break` / `continue` semantics.

