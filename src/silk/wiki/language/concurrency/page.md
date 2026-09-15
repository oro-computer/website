---
layout: "docs"
description: "Silk concurrency is built around:"
docsCollection: "silkWiki"
section: "language"
order: 39
sourcePath: "language/concurrency.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Concurrency (`async`, `task`, `await`, `yield`)

Silk concurrency is built around:

- `async fn` (pausable/awaitable concurrency),
- `task fn` (parallelizable work),
- `await` for promises,
- `yield`/`yield *` for task values.

Canonical spec + Notes: [concurrency](/silk/wiki/language/concurrency/).

## Notes

- Supported forms is documented in detail: [concurrency](/silk/wiki/language/concurrency/)

## Examples
### `task` inside `async fn` + `yield *`

```silk
task fn worker (x: int) -> int {
  return x + 1;
}

async fn main () -> int {
  task {
    let a = worker(10);
    let values: int[] = yield * a;
    return values[0];
  }
}
```

### `Task(Promise(T))` composition: `await * yield *`

```silk
async fn add1 (x: int) -> int {
  return x + 1;
}

task fn produce_promises (n: int) -> Promise(int) {
  var i: int = 0;
  while i < n {
    yield add1(i);
    i = i + 1;
  }
  return add1(n);
}

async fn main () -> int {
  task {
    let t = produce_promises(3);
    let values: int[] = await * yield * t;
    return values[0];
  }
}
```

## See also

- Full reference: [concurrency](/silk/wiki/language/concurrency/)
- [`std::task`](/silk/docs/std/task/) and [`std::sync`](/silk/docs/std/sync/): [task](/silk/wiki/std/task/), [sync](/silk/wiki/std/sync/)
