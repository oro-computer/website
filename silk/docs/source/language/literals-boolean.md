# Boolean Literals

Boolean literals are the two built-in logical values:

- `true`
- `false`

They have type `bool` (`docs/language/types.md`).

## Implementation Status (Current Compiler Subset)

What works end-to-end today (lexer → parser → checker → lowering → codegen):

- `true` / `false` literal tokens.
- `bool` variables, parameters, and return values.
- `if` / `while` conditions must have type `bool`.
- Boolean operators:
  - unary `!`,
  - short-circuit `&&` and `||` (left-to-right, skip evaluation of the right
    operand when the result is already determined).

## Examples

### Basic control flow

```silk
fn main () -> int {
  let ready: bool = true;
  if ready {
    return 0;
  } else {
    return 1;
  }
}
```

### Short-circuit evaluation

```silk
fn returns_false () -> bool {
  return false;
}

fn main () -> int {
  // Because the left operand is `true`, the right operand is evaluated.
  let a: bool = true && returns_false();
  if a {
    return 1;
  }

  // Because the left operand is `false`, the right operand is not evaluated.
  let b: bool = false && returns_false();
  if b {
    return 2;
  }

  return 0;
}
```

## Common Pitfalls

- **Assuming “truthy” values**: `bool` is a distinct type. Use comparisons to
  produce a `bool` (for example `x != 0`) rather than writing `if x { ... }`.
- **Forgetting short-circuiting**: `&&` and `||` may skip evaluating the right
  operand; do not rely on side effects in the skipped operand.

## Related Documents

- `docs/language/types.md` (the `bool` type)
- `docs/language/operators.md` (`!`, `&&`, `||`)
- `docs/language/flow-if-else.md` (`if` statement semantics)
- `docs/language/flow-while.md` (`while` statement semantics)

## Tests

- Boolean control flow:
  - `tests/silk/pass_if_bool.slk`
  - `tests/silk/pass_while_bool.slk`
- Short-circuit semantics:
  - `tests/silk/pass_bool_short_circuit_values.slk`
  - `tests/silk/pass_bool_short_circuit_call_arg.slk`
- Unary `!`:
  - `tests/silk/pass_unary_ops.slk`
