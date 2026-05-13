# `std::task`

`std::task` provides hosted task/runtime helpers, including sleep/yield
operations.

Canonical doc: [task](?p=std/task).

## Example
```silk
import task from "std/task";

fn main () -> int {
  let n: int = available_parallelism();
  yield_now();
  sleep_ms(0);
  if n < 1 { return 1; }
  return 0;
}
```

## See also

- Canonical doc: [task](?p=std/task)
- Concurrency model: [concurrency](?p=language/concurrency)
