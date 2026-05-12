# Flow control overview

Silk has familiar structured control flow:

- branching: `if` / `else`
- loops: `while`, `for`, `loop`
- structured matching: `match`
- early exit: `break`, `continue`, `return`

Canonical spec: [flow overview](?p=language/flow-overview).

## Notes

- Reference details: `docs/language/flow-*.md`

## Example
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

- `if` / `else`: [flow if else](?p=language/flow-if-else)
- `for`: [flow for](?p=language/flow-for)
- `match`: [flow match](?p=language/flow-match)
