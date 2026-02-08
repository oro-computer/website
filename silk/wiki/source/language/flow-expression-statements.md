# Expression statements

Many expressions can appear as standalone statements when followed by `;`
(assignment, calls, `++`/`--`, and other “statement-like” expressions).

Canonical spec: `docs/language/flow-expression-statements.md`.

## Status

- Implemented subset + restrictions: `docs/language/flow-expression-statements.md`

## Example (Works today): assignment + increment

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
