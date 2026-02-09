# `if` / `else`

The `if` / `else` construct provides branching based on a boolean condition.

In the current compiler subset, `if` is a **statement** that selects which
block of statements executes. The broader language design also includes
expression-oriented forms; those are documented as planned where relevant.

## Surface Syntax (Current Implemented Subset)

Minimal form:

```silk
if <condition> {
  ...
}
```

With an `else`:

```silk
if <condition> {
  ...
} else {
  ...
}
```

## `if let` (Pattern-Destructuring Statement Form)

Silk also supports an `if let` statement form for refutable pattern matching
without introducing a separate `match` expression:

```silk
if let <pattern> = <scrutinee> {
  ...
} else {
  ...
}
```

Notes:

- The scrutinee expression is evaluated exactly once.
- The pattern binders (for example `Some(v)` binds `v`) are in scope only in
  the `then` block.
- `else` is optional (when omitted, a non-matching scrutinee executes no block).
- `else if let ...` chains are supported and parse as nesting in the same way
  as `else if ...`.

Supported patterns in the current subset (same as `match` expressions; see
`docs/language/flow-match.md`):

- optionals: `None`, `Some(name)`, `Some(_)`
- recoverable results: `Ok(name)`, `Err(name)` (and `_` binders)
- enums: `Variant(...)` / `E::Variant(...)` / qualified variants
- type unions: `name: Type` / `_: Type`

Example (optional):

```silk
fn main () -> int {
  let maybe: int? = Some(7);

  if let Some(v) = maybe {
    return v;
  }
  return 0;
}
```

Example (recoverable `Result`):

```silk
import std::result;

fn main () -> int {
  let r: std::result::Result(int, string) = Ok(42);
  if let Ok(v) = r {
    return v;
  }
  return 0;
}
```

Notes:

- `<condition>` is an expression; parentheses are optional because the normal
  expression grammar already includes parenthesized expressions.
- Bodies are blocks. `else` may be followed by either:
  - a block (`else { ... }`), or
  - another `if` (`else if ... { ... }`) to form an “else-if” chain.

## Surface Syntax (Expression Form)

Silk also supports `if` / `else` as an **expression** form that yields a value:

```silk
let v: int = if cond { 123 } else { 456 };
```

Notes:

- `if` expressions require an `else` branch so the expression yields a value on
  all paths.
- The `else if ...` chain form is supported in expression position:

  ```silk
  let v: int = if a { 1 } else if b { 2 } else { 3 };
  ```

- Current compiler subset restriction: the `{ ... }` bodies of `if` expressions
  contain a single expression (not a full statement block).

## Semantics

- The condition expression is evaluated exactly once.
- If the condition is `true`, the `if` block executes and the `else` block (if
  present) does not execute.
- If the condition is `false`, the `else` block executes if present; otherwise
  the `if` statement does nothing.

Blocks create scopes:

- Declarations inside the `if` body are not visible outside that body.
- Declarations inside the `else` body are not visible outside that body.

## Type Checking Rules

- The condition must have type `bool`. If it does not, the checker reports a
  type mismatch (`docs/compiler/diagnostics.md`, `E2001`).

For `if` expressions:

- The `then` and `else` branches must produce compatible value types.
- The expression’s result type is the shared branch type (or the expected type
  when the expression is type-directed).

## `else if` Chains (Planned vs Current Subset)

The language supports chained conditions (“else-if chains”). The compiler
parses `else if` as sugar for nesting an `if` inside the `else` block:

```silk
fn main () -> int {
  let x: int = 1;

  if x == 0 {
    return 0;
  } else {
    if x == 1 {
      return 1;
    } else {
      return 2;
    }
  }
}
```

The equivalent direct surface form is:

```silk
fn main () -> int {
  let x: int = 1;
  if x == 0 {
    return 0;
  } else if x == 1 {
    return 1;
  } else {
    return 2;
  }
}
```

## Examples

### Minimal `if` / `else`

```silk
fn main () -> int {
  if true {
    return 0;
  } else {
    return 1;
  }
}
```

### Boolean expressions in conditions

```silk
fn main () -> int {
  let x: int = 1;
  let y: int = 2;

  if x < y && y < 10 {
    return 3;
  } else {
    return 4;
  }
}
```

### Control flow inside branches

```silk
fn main () -> int {
  let x: int = 1;
  let y: int = 2;

  if x < y {
    while false {
      continue;
    }
    return 3;
  } else {
    return 4;
  }
}
```

## Implementation Status (Current Compiler Subset)

Implemented end-to-end:

- `if <expr> { ... }` and `if <expr> { ... } else { ... }` statement forms.
- `if let <pattern> = <expr> { ... }` statement form (and `else if let` chains).
- Boolean type-checking for conditions.
- `if` expressions of the form `if <cond> { <expr> } else { <expr> }`.

Not implemented yet:

- General block expressions (`{ stmt* <expr> }`) outside the specific `if`
  expression form.

Examples that exercise the implemented subset:

- `tests/silk/pass_if_bool.slk`
- `tests/silk/pass_if_logical.slk`
- `tests/silk/pass_bool_local_if.slk`
- `tests/silk/pass_nested_if_while.slk`
- `tests/silk/pass_if_expr_basic.slk`
