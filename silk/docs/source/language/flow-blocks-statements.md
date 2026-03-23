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
  - `if` / `else` statements (including `if let` pattern destructuring),
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

Destructuring `let` bindings (implemented subset) bind multiple locals from a
single struct value:

- Positional (field order):

  ```silk
  struct User { id: u64, name: string }
  let (id, name) = User{ id: 123, name: "alice" };
  ```

- Named (by field name, order-independent), with aliasing:

  ```silk
  struct Record { id: u64, data: string }
  let { data, id } = Record{ id: 123, data: "a record" };
  let { data as d, id as i } = Record{ id: 456, data: "other record" };
  ```

Array destructuring binds multiple locals from a single array/slice value:

```silk
struct Record { id: u64, data: string }

let records: Record[] = [{ id: 123, data: "a" }, { id: 456, data: "b" }];
let [a, b] = records;
```

Rules (current subset):

- Only flat patterns are supported (no nested destructuring).
- The initializer is required.
- The initializer must have a non-opaque `struct` value type.
- The pattern must account for every field exactly once:
  - positional patterns must have exactly one binder per declared field (in
    field order),
  - named patterns must list each field exactly once (in any order),
  - use `_` to discard a field (`let (_, name) = ...;` or `let { data as _ } = ...;`).

For array/slice destructuring:

- The initializer must have an array type (`T[N]`) or slice type (`T[]`).
- Each binder is positional (index order).
- The pattern binds exactly the number of listed binders:
  - fixed arrays require an exact arity match (`[a, b]` requires `T[2]`),
  - slices trap at runtime if too short (as if indexing each element).

Enum destructuring binds payload elements from a single enum variant:

```silk
import std::result;

error Oops { code: int }

fn foo (oops: bool) -> std::result::Result(int, Oops) {
  if (oops) {
    return Err(Oops{ code: 123 });
  }
  return Ok(7);
}

fn main () -> int {
  // Destructure `Ok(...)` and bind its payload.
  // If the value is `Err(...)`, the program traps.
  let Ok(value) = foo(false);
  return value;
}
```

Rules (current subset):

- The initializer is required.
- The initializer must have an enum type `E` (including a monomorphized generic enum).
- The initializer value is consumed (moved); the original binding may not be
  used after destructuring.
- The pattern must be an enum variant pattern:
  - `Variant(...)` (shorthand), or
  - `E::Variant(...)` / `pkg::E::Variant(...)` / `::pkg::E::Variant(...)`.
- Binder arity must match the variant payload arity (use `_` to discard payload elements).
- If the runtime value is not the matched variant, execution traps.

### Refutable bindings: `let ... else { ... };`

For refutable patterns where you want explicit control-flow on mismatch (instead
of trapping), Silk provides a `let ... else` statement form:

```silk
let <pattern> = <expr> else {
  // must end with a terminal statement
};
```

Semantics (current subset):

- The initializer expression is evaluated exactly once.
- If the pattern matches, the pattern binders are introduced into the **current
  scope** for the remainder of the block (like a normal `let` binding).
- If the pattern does not match, the `else` block executes.
- The `else` block must be **terminal** (it must not fall through), so the
  binders are always available after the statement on any path that continues.
- The binders are **not** in scope inside the `else` block.

Examples:

```silk
fn main () -> int {
  let maybe: int? = Some(7);
  let Some(v) = maybe else { return 0; };
  return v;
}
```

```silk
import std::result;

error Oops { code: int }

fn foo (ok: bool) -> std::result::Result(int, Oops) {
  if ok { return Ok(7); }
  return Err(Oops{ code: 123 });
}

fn main () -> int {
  let Ok(v) = foo(true) else { return 1; };
  return v;
}
```

`const` bindings are compile-time constants:

- their initializer expression must be compile-time evaluable (otherwise the
  compiler reports an error),
- the binding is immutable (there is no `const mut`),
- a `const` binding is a normal runtime value (unlike `#const`), but its value
  is computed by the compiler at compile time and does not incur runtime
  computation cost in the current compiler subset.

In the current compiler subset, compile-time evaluation for runtime `const`
bindings is restricted to:

- scalar primitive types (`bool`, integer/float scalars, `char`, `Instant`, `Duration`),
- compile-time POD `struct` types whose fields are compile-time scalar value types and that do not require `Drop`, and
- compile-time evaluable expressions composed of:
  - literals,
  - other `const` bindings,
  - calls to `const fn` functions where all arguments are themselves compile-time evaluable, and
  - struct literals and field access when the struct type is a supported compile-time POD `struct`, and
  - `as` casts between supported scalar types, and
  - a small operator subset (notably `+`, `-`, `*`, bitwise ops, shifts; `/` and `%` are currently rejected for `const`).

- `string` bindings whose initializer is either:
  - a string literal (`"..."` or `` `...` ``), or
  - another `const` string binding.

Example:

```silk
struct Point { x: int, y: int }

const origin: Point = Point{ x: 0, y: 0 };
const ox: int = origin.x;
```

Formal Silk declarations (`#const`) are compile-time-only names intended for specifications
(`#require`, `#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`). They must not be referenced
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
