# Expression statements

Many expressions can appear as standalone statements when followed by `;`
(assignment, calls, `++`/`--`, and other “statement-like” expressions).

Canonical spec: [flow expression statements](?p=language/flow-expression-statements).

## Notes

- Supported forms + restrictions: [flow expression statements](?p=language/flow-expression-statements)

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

- Canonical spec: [flow expression statements](?p=language/flow-expression-statements)
- Operators: [operators](?p=language/operators)
