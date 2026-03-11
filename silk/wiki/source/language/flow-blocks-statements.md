# Blocks and statements

Blocks (`{ ... }`) group statements and introduce a new scope.

[Canonical spec](../docs/?p=language/flow-blocks-statements).

## Status

- Implemented subset + syntax notes: [Blocks and Statement Composition](../docs/?p=language/flow-blocks-statements)

## Example: scope boundaries
```silk
fn main () -> int {
  let x: int = 1;
  {
    let y: int = 2;
    if x + y != 3 {
      return 1;
    }
  }
  // `y` is not in scope here.
  return 0;
}
```

## See also

- [Canonical spec](../docs/?p=language/flow-blocks-statements)
- Expression statements: [Expression statements](?p=language/flow-expression-statements)
