# Function disciplines (`pure`, `async`, `task`)

Function modifiers declare constraints and concurrency behavior:

- `pure fn` for side-effect-free functions (checker-enforced subset)
- `async fn` for promise-producing functions
- `task fn` for task-producing functions
- `const fn` for compile-time-evaluable functions (see
  [Const functions](?p=language/const-functions))

[Canonical doc](../docs/?p=language/function-disciplines).

## Status

- `pure fn` checking is implemented for the current subset.
- Hosted adapters already exist for common `async` crossings, including
  `std::task` awaitable sleep, `std::io::async`, `std::net` async
  connect/accept, and `std::runtime::event_loop`.

## Examples
```silk
pure fn add (x: int, y: int) -> int {
  return x + y;
}

async fn answer () -> int {
  return 42;
}

task fn worker (x: int) -> int {
  return x + 1;
}
```

## See also

- [Canonical doc](../docs/?p=language/function-disciplines)
- [Concurrency](?p=language/concurrency)
