# Flow control overview

Silk has familiar structured control flow:

- branching: `if` / `else`
- loops: `while`, `for`, `loop`
- structured matching: `match`
- early exit: `break`, `continue`, `return`

[Canonical spec](../docs/?p=language/flow-overview).

## Status

- Implemented-subset details live in the per-construct pages linked below.

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

- `if` / `else`: [if / else](?p=language/flow-if-else)
- `for`: [for loops](?p=language/flow-for)
- `match`: [match](?p=language/flow-match)
