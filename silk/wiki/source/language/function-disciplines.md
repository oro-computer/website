# Function disciplines (`pure`, `async`, `task`)

Function modifiers declare constraints and concurrency behavior:

- `pure fn` for side-effect-free functions (checker-enforced subset)
- `async fn` for promise-producing functions
- `task fn` for task-producing functions
- `const fn` for compile-time-evaluable functions (see [`/silk/docs/?p=language/const-functions`](/silk/docs/?p=language/const-functions))

Canonical doc: [`/silk/docs/?p=language/function-disciplines`](/silk/docs/?p=language/function-disciplines).

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

- Canonical doc: [`/silk/docs/?p=language/function-disciplines`](/silk/docs/?p=language/function-disciplines)
- Concurrency: [`/silk/wiki/?p=language/concurrency`](/silk/wiki/?p=language/concurrency)
