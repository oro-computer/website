---
layout: "docs"
description: "std::task provides hosted task/runtime helpers, including sleep/yield operations."
docsCollection: "silkWiki"
section: "std"
order: 79
sourcePath: "std/task.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::task`](/silk/docs/std/task/)

[`std::task`](/silk/docs/std/task/) provides hosted task/runtime helpers, including sleep/yield
operations.

Full reference: [task](/silk/wiki/std/task/).

## Example
```silk
import std::task;

fn main () -> int {
  let n: int = available_parallelism();
  yield_now();
  sleep_ms(0);
  if n < 1 { return 1; }
  return 0;
}
```

## See also

- Full reference: [task](/silk/wiki/std/task/)
- Concurrency model: [concurrency](/silk/wiki/language/concurrency/)
