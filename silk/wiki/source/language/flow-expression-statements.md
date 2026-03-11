# Expression statements

Many expressions can appear as standalone statements when followed by `;`
(assignment, calls, `++`/`--`, and other “statement-like” expressions).

[Canonical spec](../docs/?p=language/flow-expression-statements).

## Status

- Implemented subset + restrictions: [Expression Statements](../docs/?p=language/flow-expression-statements)

## Example: assignment + increment
```silk
fn main () -> int {
  let mut x: int = 0;
  x += 1;
  ++x;
  return x;
}
```

## See also

- [Canonical spec](../docs/?p=language/flow-expression-statements)
- Operators: [Operators](?p=language/operators)
