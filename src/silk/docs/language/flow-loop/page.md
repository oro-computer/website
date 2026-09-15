---
layout: "docs"
description: "The loop statement executes a block repeatedly until it is terminated by a break or return."
docsCollection: "silk"
section: "language"
order: 16
sourcePath: "language/flow-loop.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`loop`](/silk/wiki/language/flow-loop/) Loop

The [`loop`](/silk/wiki/language/flow-loop/) statement executes a block repeatedly until it is terminated by a
`break` or `return`.

: `loop { ... }`, plus `async loop { ... }` and
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
- In Silk currently, `async loop` / `task loop` follow the same
 async-context restriction as `async { ... }` / `task { ... }`:
 they are only allowed inside functions declared with `async`
 ([diagnostics](/silk/docs/compiler/diagnostics/), `E2031`).

## Semantics

- The body block executes repeatedly.
- `break;` exits the nearest enclosing loop and continues execution at the
 statement immediately following the loop ([flow break](/silk/docs/language/flow-break/)).
- `continue;` skips the remainder of the current iteration’s body and begins the
 next iteration ([flow continue](/silk/docs/language/flow-continue/)).
- `return;` exits the current function ([flow return](/silk/docs/language/flow-return/)).

## Type Checking Rules

- The loop body is checked in a loop context so `break` / `continue` are valid.
- `break;` outside a loop is rejected ([diagnostics](/silk/docs/compiler/diagnostics/), `E2007`).
- `continue;` outside a loop is rejected ([diagnostics](/silk/docs/compiler/diagnostics/), `E2008`).

## Notes

Supported forms:

- `loop { ... }`, `async loop { ... }`, and `task loop { ... }` parse, type-check,
 and lower with correct `break` / `continue` semantics.
