# Flow control overview

Silk has familiar structured control flow:

- branching: `if` / `else`
- loops: `while`, `for`, `loop`
- structured matching: `match`
- early exit: `break`, `continue`, `return`

Canonical spec: `docs/language/flow-overview.md`.

## Status

- Implemented-subset details: `docs/language/flow-*.md`

## Example (Works today)

```silk
fn main () -> int {
 let mut sum: int = 0;

 for i in 0..5 {
 if i == 3 {
 continue;
 }
 sum += i;
 }

 if sum > 0 {
 return sum;
 }
 return 0;
}
```

## See also

- `if` / `else`: `docs/wiki/language/flow-if-else.md`
- `for`: `docs/wiki/language/flow-for.md`
- `match`: `docs/wiki/language/flow-match.md`
