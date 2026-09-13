---
layout: "docs"
title: "Boolean Literals"
description: "Boolean literals are the two built-in logical values:"
docsCollection: "silk"
section: "language"
order: 38
sourcePath: "language/literals-boolean.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Boolean Literals

Boolean literals are the two built-in logical values:

- `true`
- `false`

They have type `bool` ([types](/silk/docs/language/types/)).

## Notes

What works end-to-end today (lexer → parser → checker → lowering → codegen):

- `true` / `false` literal tokens.
- `bool` variables, parameters, and return values.
- `if` / [`while`](/silk/wiki/language/flow-while/) conditions must have type `bool`.
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

- [types](/silk/docs/language/types/) (the `bool` type)
- [operators](/silk/docs/language/operators/) (`!`, `&&`, `||`)
- [flow if else](/silk/docs/language/flow-if-else/) (`if` statement semantics)
- [flow while](/silk/docs/language/flow-while/) ([`while`](/silk/wiki/language/flow-while/) statement semantics)
