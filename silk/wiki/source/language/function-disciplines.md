# Function disciplines (`pure`, `async`, `task`)

Function modifiers declare constraints and concurrency behavior:

- `pure fn` for side-effect-free functions (checker-enforced subset)
- `async fn` for promise-producing functions
- `task fn` for task-producing functions
- `const fn` for compile-time-evaluable functions (see `wiki/language/const-functions.md`)

Canonical doc: `docs/language/function-disciplines.md`.

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

- Canonical doc: `docs/language/function-disciplines.md`
- Concurrency: `wiki/language/concurrency.md`
