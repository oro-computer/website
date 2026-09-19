---
layout: "docs"
description: "break exits the nearest enclosing loop."
docsCollection: "silk"
section: "language"
order: 19
sourcePath: "language/flow-break.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `break`

`break` exits the nearest enclosing loop.

## Surface Syntax

```silk
break;
```

Notes:

- `break` is a statement, terminated by a semicolon.
- `break` does not carry a value in the current language design; there is no
 `break <expr>` form.

## Semantics

When executed, `break;`:

- terminates the innermost enclosing loop ([`loop`](/silk/wiki/language/flow-loop/), [`while`](/silk/wiki/language/flow-while/), or `for`), and
- continues execution at the statement immediately following that loop.

In nested loops, `break` only exits the nearest loop:

```silk
fn main () -> int {
  while true {
    while true {
      break; // exits the inner loop only
    }
    break; // exits the outer loop
  }
  return 0;
}
```

`break` does not exit the current function. Use `return` for that.

## Type Checking Rules

- `break` is only permitted inside a loop body.
- A `break` outside a loop is a type-check error ([diagnostics](/silk/docs/compiler/diagnostics/),
 `E2007`).

## Notes



- `break;` is accepted inside loops ([`loop`](/silk/wiki/language/flow-loop/), [`while`](/silk/wiki/language/flow-while/), and `for`) and lowered
 end-to-end.
- `break;` outside of a loop is rejected (`E2007`).

examples:


## Common Pitfalls

- Forgetting the semicolon (`break` is a statement).
- Expecting `break` to return a value (not supported).
- Using `break` outside a loop (rejected, `E2007`).
