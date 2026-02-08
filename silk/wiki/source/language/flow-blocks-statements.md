# Blocks and statements

Blocks (`{ ... }`) group statements and introduce a new scope.

Canonical spec: `docs/language/flow-blocks-statements.md`.

## Status

- Implemented subset + syntax notes: `docs/language/flow-blocks-statements.md`

## Example (Works today): scope boundaries

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

- Canonical spec: `docs/language/flow-blocks-statements.md`
- Expression statements: `docs/wiki/language/flow-expression-statements.md`
