# `std::task`

`std::task` provides hosted task/runtime helpers, including sleep/yield
operations.

Canonical doc: `docs/std/task.md`.

## Example (Works today)

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

- Canonical doc: `docs/std/task.md`
- Concurrency model: `docs/wiki/language/concurrency.md`
