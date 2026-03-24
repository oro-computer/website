# Expression statements

Many expressions can appear as standalone statements when followed by `;`
(assignment, calls, `++`/`--`, and other “statement-like” expressions).

Full reference: `docs/language/flow-expression-statements.md`.

## Notes

- Full reference: `docs/language/flow-expression-statements.md`

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

- Canonical spec: `docs/language/flow-expression-statements.md`
- Operators: `docs/wiki/language/operators.md`
