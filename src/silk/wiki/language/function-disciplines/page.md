---
layout: "silkWiki-docs"
title: "Function disciplines (pure, async, task)"
description: "Function modifiers declare constraints and concurrency behavior:"
docsCollection: "silkWiki"
section: "language"
order: 40
sourcePath: "language/function-disciplines.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Function disciplines (`pure`, `async`, `task`)

Function modifiers declare constraints and concurrency behavior:

- `pure fn` for side-effect-free functions (checker-enforced subset)
- `async fn` for promise-producing functions
- `task fn` for task-producing functions
- `const fn` for compile-time-evaluable functions (see [const functions](/silk/wiki/language/const-functions/))

Full reference: [function disciplines](/silk/wiki/language/function-disciplines/).

## Examples
```silk
pure fn add (x: int, y: int) -> int {
  return x + y;
}

task fn worker (x: int) -> int {
  return x + 1;
}
```

## See also

- Full reference: [function disciplines](/silk/wiki/language/function-disciplines/)
- Concurrency: [concurrency](/silk/wiki/language/concurrency/)
