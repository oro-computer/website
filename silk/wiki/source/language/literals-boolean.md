# Boolean literals

Silk has the boolean type `bool` with literals `true` and `false`.

Reference: [boolean literals](../docs/?p=language/literals-boolean).

## Basic Use

```silk
fn main () -> int {
  let ok: bool = true;
  if ok && !false {
    return 0;
  }
  return 1;
}
```

Booleans are not numbers. Conditions must have type `bool`; write a comparison
when you want to branch on an integer:

```silk
fn is_empty (count: int) -> bool {
  return count == 0;
}
```

## Operators

Boolean expressions use:

- `!x` for logical not
- `a && b` for and
- `a || b` for or
- `a == b` and `a != b` for equality

`&&` and `||` short-circuit from left to right:

```silk
fn ready () -> bool {
  return true;
}

fn main () -> int {
  if ready() && true {
    return 0;
  }
  return 1;
}
```

## Common Mistakes

- Do not write `if x { ... }` for an integer `x`; use `if x != 0 { ... }`.
- Avoid hiding side effects inside the right side of `&&` or `||`, because it
 may not run.
- Use clear predicate names such as `is_ready`, `has_value`, or `can_write`.

## Related

- Types: [types](?p=language/types)
- Operators: [operators](?p=language/operators)
- `if` / `else`: [if else](?p=language/flow-if-else)
