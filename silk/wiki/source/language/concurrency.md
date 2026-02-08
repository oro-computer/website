# Concurrency (`async`, `task`, `await`, `yield`)

Silk concurrency is built around:

- `async fn` (pausable/awaitable concurrency),
- `task fn` (parallelizable work),
- `await` for promises,
- `yield`/`yield *` for task values.

Canonical spec + implemented subset notes: `docs/language/concurrency.md`.

## Status

- Implemented subset is documented in detail: `docs/language/concurrency.md`
- End-to-end fixtures: `tests/silk/pass_concurrency_*.slk`

## Examples (Works today)

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

- Canonical spec: `docs/language/concurrency.md`
- `std::task` and `std::sync`: `docs/std/task.md`, `docs/std/sync.md`
