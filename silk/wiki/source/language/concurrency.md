# Concurrency (`async`, `task`, `await`, `yield`)

Silk concurrency is built around:

- `async fn` (pausable/awaitable concurrency),
- `task fn` (parallelizable work),
- `await` for promises,
- `yield` / `yield *` for task values.

[Canonical doc](../docs/?p=language/concurrency).

## Status

- Hosted concurrency already includes `std::task`, `std::sync`,
  `std::runtime::event_loop`, and `std::io::async`.
- `std::task` / `std::sync` are still mostly blocking primitives today; richer
  async coverage and structured-concurrency runtime semantics remain incomplete.

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

- [Canonical doc](../docs/?p=language/concurrency)
- [`std::task`](?p=std/task)
- [`std::sync`](?p=std/sync)
