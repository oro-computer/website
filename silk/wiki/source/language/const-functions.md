# Const Functions (`const fn`)

`const fn` marks a function as eligible for **compile-time evaluation**.

This wiki page is an overview. The canonical specification is
[Const Functions (const fn)](../docs/?p=language/const-functions).

## Example

```silk
const fn add (a: int, b: int) -> int {
  return a + b;
}

const answer: int = add(20, 22);

fn main () -> int {
  return answer;
}
```

## Notes (Current Subset)

- Const functions are intended for `const` initializer evaluation.
- Const functions are compile-time-only: they are not callable from runtime
  code and are not emitted as runtime/linkable symbols.
- The current subset targets scalar-only const evaluation; `string`/aggregate
  return values and higher-order const evaluation are planned.
- In the current subset, `const fn` bodies must not allocate (`new`) or use
  regions/`with`, must not contain `panic`, and may only call other `const fn`
  declarations.

## See also

- [Canonical spec](../docs/?p=language/const-functions)
- `const` bindings: [Blocks and Statement Composition](../docs/?p=language/flow-blocks-statements)
- Function modifiers (`pure`/`async`/`task`): [Function Disciplines (pure, task, async)](../docs/?p=language/function-disciplines)
