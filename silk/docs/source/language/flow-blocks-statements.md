# Blocks and Statement Composition

Blocks group statements, establish lexical scopes, and provide the “body” form
for structured control-flow constructs like `if`, `while`, and the `match`
statement used for typed errors.

## Surface Syntax

A block is a sequence of zero or more statements delimited by braces:

```silk
{
  stmt0;
  stmt1;
  ...
}
```

The empty block `{}` is permitted.

## Statements (Current Implemented Subset)

The current compiler subset supports these statement forms (see
`docs/language/grammar.md` for exact syntax):

- Local bindings:
  - `const` (compile-time constant binding; initializer must be const-evaluable),
  - `let` and `let mut` (and `var` as an alias for `let mut`).
- Specification-only declarations: `#const` (Formal Silk; not usable in runtime expressions).
- Structured blocks: `async { ... }` / `task { ... }` (see `docs/language/concurrency.md`).
- Expression statements: limited to calls, assignments, and increment/decrement
  in the current subset (`docs/language/flow-expression-statements.md`).
- Flow control:
  - `if` / `else` statements,
  - `while` loops,
  - `break`, `continue`,
  - `return`,
  - `assert`,
  - `panic` (typed errors),
  - `match` statement (typed errors; see `docs/language/typed-errors.md`).

## Semantics

### Sequencing

Statements in a block execute in source order. If a statement transfers control
out of the current block (`return`, `panic`, `break`/`continue` inside loops),
the remainder of the block is not executed on that path.

### Scope

A block introduces a lexical scope:

- Names declared by `const`/`let`/`var` are visible only after their
  declaration within the same block, and within any nested blocks.
- Inner blocks may shadow outer bindings by reusing a name (this is a normal
  lexical-shadowing rule; the checker should reject only when a specific
  feature imposes stricter rules).
- The special name `_` is a discard binding:
  - `let _ = expr;` and `let _: T = expr;` evaluate the initializer but do not
    introduce a binding into scope.
  - `_` may be used repeatedly in the same scope without conflicts.
  - Any produced runtime value is cleaned up at end-of-statement (not at scope
    exit).

`const` bindings are compile-time constants:

- their initializer expression must be compile-time evaluable (otherwise the
  compiler reports an error),
- the binding is immutable (there is no `const mut`),
- a `const` binding is a normal runtime value (unlike `#const`), but its value
  is computed by the compiler at compile time and does not incur runtime
  computation cost in the current compiler subset.

In the current compiler subset, compile-time evaluation for runtime `const`
bindings is restricted to:

- scalar primitive types (`bool`, integer/float scalars, `char`, `Instant`, `Duration`), and
- pure scalar expressions composed of:
  - literals,
  - other `const` bindings,
  - calls to `const fn` functions where all arguments are themselves compile-time evaluable, and
  - `as` casts between supported scalar types, and
  - a small operator subset (notably `+`, `-`, `*`, bitwise ops, shifts; `/` and `%` are currently rejected for `const`).

- `string` bindings whose initializer is either:
  - a string literal (`"..."` or `` `...` ``), or
  - another `const` string binding.

Formal Silk declarations (`#const`) are compile-time-only names intended for specifications
(`#require`, `#assure`, `#assert`, `#invariant`, `#variant`). They must not be referenced
in runtime expressions (see `docs/language/formal-verification.md` and
`docs/compiler/diagnostics.md`, `E2014`).

### Blocks as Expressions (Planned)

The broader language design includes expression-oriented flow constructs (for
example `match` expressions today and `if` expressions).

In the current compiler subset:

- a block is not an expression and does not produce a value; it is purely a
  statement list used as the body of constructs.

The `if` expression form is a special-case expression-oriented construct; it
does not make `{ ... }` a general expression form.

If/when general block expressions are introduced, the spec will define:

- which contexts accept them (and how ambiguity with `{ ... }` struct literals
  is resolved), and
- how their result values are computed.

## Examples

### Nested scope

```silk
fn main () -> int {
  let x: int = 1;
  {
    let y: int = 2;
    if x < y {
      return 0;
    }
  }
  return 1;
}
```

### Formal Silk declarations for loop specifications

```silk
fn main () -> int {
  let limit: int = 3;
  #const original_limit = limit;

  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= original_limit;
  #variant original_limit - i;
  while i < limit {
    i = i + 1;
  }

  return 0;
}
```

## Implementation Status (Current Compiler Subset)

Implemented end-to-end:

- Block scoping for runtime `let`/`var` bindings and nested blocks.
- Formal Silk `#const` declarations (parsed, type-checked, and rejected if used at runtime).

Examples that exercise the implemented subset:

- `tests/silk/pass_let_locals.slk`
- `tests/silk/pass_spec_const_while.slk`
