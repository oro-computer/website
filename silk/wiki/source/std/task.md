# `std::task`

`std::task` provides hosted task/runtime helpers, including sleep/yield
operations.

[Canonical doc](../docs/?p=std/task).

## Status

- The current hosted subset exposes blocking thread helpers such as
  `yield_now()` and `sleep_ms()`.
- Awaitable sleep helpers such as `sleep_ms_async()` already exist for hosted
  `async` code.

## Example
```silk
import std::task;

fn main () -> int {
  let n: int = std::task::available_parallelism();
  std::task::yield_now();
  std::task::sleep_ms(0);
  if n < 1 { return 1; }
  return 0;
}
```

## Example: awaitable sleep
```silk
import std::task;

async fn main () -> int {
  await std::task::sleep_ms_async(10);
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/task)
- [Concurrency model](?p=language/concurrency)
