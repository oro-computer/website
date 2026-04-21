# Function disciplines (`pure`, `async`, `task`)

Function modifiers declare constraints and concurrency behavior:

- `pure fn` for side-effect-free functions (checker-enforced subset)
- `async fn` for promise-producing functions
- `task fn` for task-producing functions
- `const fn` for compile-time-evaluable functions (see [const functions](?p=language/const-functions))

Canonical doc: [function disciplines](?p=language/function-disciplines).

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

- Canonical doc: [function disciplines](?p=language/function-disciplines)
- Concurrency: [concurrency](?p=language/concurrency)
