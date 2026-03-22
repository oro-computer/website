# `match` Expression (and Statement)

The `match` expression provides structured pattern matching.

Key ideas:

- A `match` selects one of several branches based on a scrutinee expression.
- Arm guards of the form `pattern if cond => ...` are not implemented in any
  `match` form yet.
- `match` is an expression; all arms must be compatible in type.

The compiler must:

- Enforce exhaustiveness rules (where specified).
- Type check each arm and compute a consistent result type.

## Surface Syntax

`match` is accepted as an *expression* of the form:

```silk
match <scrutinee> {
  <pattern> => <expr>,
  <pattern> => <expr>,
}
```

Notes:

- Arms are separated by commas; a trailing comma is permitted.
- Arm bodies are expressions (not blocks).
- Expression-form `match` is implemented for:
  - optionals,
  - primitive integers,
  - enums,
  - type unions,
  - and recoverable `Result`-style values.
- Guard clauses of the form `pattern if cond => ...` are unsupported
  across all of those subsets.

### Optional Matching (`T?`)

For optionals:

- The scrutinee expression must have optional type `T?` (`Option(T)`), where `T`
  is a payload type supported by the current backend subset.
- Patterns are restricted to:
  - `None`
  - `Some(<name>)`
  - `Some(_)`
- No guards (`if ...`) are implemented yet.
- Matches must be exhaustive for the optional scrutinee: there must be exactly
  one `None` arm and exactly one `Some(...)` arm (order is not significant).

Example:

```silk
fn main () -> int {
  let x: int? = Some(7);
  let y: int = match x {
    None => 5,
    Some(v) => v,
  };
  return y;
}
```

### Integer Matching (Primitive Integers)

The compiler also supports a small `match` subset for integer-like primitive
scrutinees.

Current behavior:

- The scrutinee expression must have a primitive integer type in the current
  backend subset (`int`, `i64`, `u64`, and the fixed-width integer primitives).
- Patterns are restricted to:
  - integer literals (`0`, `1`, `123`, `0xFF`, ...), and
  - a wildcard `_` arm.
- The match must be exhaustive:
  - there must be exactly one wildcard `_` arm, and
  - literal arms must not repeat the same value.
- No guards (`if ...`) are implemented yet.

Example:

```silk
fn main () -> int {
  let x: int = 0;
  let y: int = match (x) {
    0 => 1,
    _ => 2,
  };
  return y;
}
```

### Enum Matching (`enum`)

The language design supports matching over user-defined `enum` types
(`docs/language/enums.md`).

Current behavior:

- The scrutinee expression must have an enum type `E` (including an
  instantiated generic enum in module-set builds).
- Patterns are restricted to enum variants:
  - unit variants: `E::Cancelled` or `Cancelled`
  - tuple variants: `E::Msg(x)` / `Msg(x)` / `E::Pair(a, b)` / `Pair(a, b)` (binders may be identifiers or `_`)
- For instantiated generic enums, the qualifier `E` in patterns may be a type
  alias for the instantiation (for example `type R = Result(int, string);` then
  `R::Ok(v)` / `R::Err(e)`), or patterns may omit the qualifier and use the
  variant name directly.
- No guards (`if ...`) are implemented yet.
- In expression form, enum matches must be exhaustive by explicit variant
  coverage:
  - there must be exactly one arm for each enum variant, and
  - wildcard `_` arms are not part of the expression-form enum subset.

### Type Union Matching (`T1 | T2 | ...`)

The language supports matching over **type unions** (`docs/language/type-unions.md`).

Current behavior:

- The scrutinee expression must have a union type `T1 | ... | Tn`.
- Patterns are restricted to typed binders:
  - `name: Ti` (binds the payload as `Ti`), or
  - `_: Ti` (matches and ignores the payload),
  where `Ti` is one of the union member types.
- No guards (`if ...`) are implemented yet.
- Matches must be exhaustive: there must be exactly one arm per union member
  type (order is not significant).

## Semantics

- The scrutinee expression is evaluated exactly once.
- The selected arm is chosen based on the scrutinee value; non-selected arms
  are not evaluated.
- For `Some(v) => ...`, the binder `v` is in scope only within that arm and has
  type `T` (the inner payload type of the scrutinee `T?`).
- The result type of a `match` expression is the common type of its arms; all
  arms must type-check to the same result type.

## `match` Statement (Block Arms)

Silk also supports a *statement* form of `match` whose arms are blocks. This is
the ergonomic counterpart to the expression form when an arm must perform
multiple statements (printing, early returns, mutation, etc).

Surface form:

```silk
match (<scrutinee>) {
  <pattern> => { ... },
  <pattern> => { ... },
}
```

The statement form may also use a single-expression arm body without braces:

```silk
match (x) {
  _ => do_work(),
}
```

An optional trailing semicolon is permitted after the closing brace:

```silk
match (x) { _ => { } };
```

Today, the statement form is supported for:

- ordinary value matching (no typed-error contract), and
- typed error handling (`docs/language/typed-errors.md`).

### Ordinary value matching

When the scrutinee expression is an ordinary value (it does *not* have a typed
error contract), the statement form supports the same scrutinee + pattern
subsets as the `match` expression form in this document:

- optionals (`T?`): `None` / `Some(name)` / `Some(_)`
- primitive integers: integer literals and `_`
- enums (`enum`): enum variants (see note below)
- type unions (`T1 | ... | Tn`): typed binders `name: Ti` / `_: Ti`
- recoverable results: `Ok(name)` / `Ok(_)` and `Err(name)` / `Err(_)`

Exhaustiveness rules:

- Expression `match` remains exhaustive.
- Statement `match` is also exhaustive by default.
- For `Option(T)` and recoverable `Result`-like values only, the statement form
  may omit one side of the split:
  - `match (opt) { Some(v) => { ... } }`
  - `match (opt) { None => { ... } }`
  - `match (res) { Ok(v) => { ... } }`
  - `match (res) { Err(e) => { ... } }`
- In that one-arm statement form, the unhandled case is an implicit no-op.
- This partial form does not apply to expression `match`, integer matches,
  general enums, type unions, or typed-error matches.

Notes:

- The preferred single-branch control-flow forms remain `if let`, `let ... else`,
  and `while let` when they fit naturally.
- For enums, wildcard support is not end-to-end yet:
  - expression-form enum matches require explicit arms for every variant,
  - statement-form ordinary enum matches also still require explicit variant
    coverage in the current backend,
  - and although the checker already reserves `_` as a catch-all pattern for
    ordinary enum statements, lowering still rejects that form today.

Enum variant pattern note (statement form):

- In the statement form, a bare identifier pattern `name` is reserved for a
  catch-all binder arm (used by typed error matches), so enum variant patterns
  must be written in qualified form: `E::Variant(...)` (including
  `::pkg::E::Variant(...)`).
- `match (stream) { Error => { ... } }` therefore treats `Error` as a binder
  arm, while `match (stream) { IOStream::Error => { ... } }` matches the unit
  enum variant.
- The checker reserves `_` as a catch-all arm for ordinary enum statements, but
  the current backend still rejects that form, so end-to-end ordinary
  enum statements still need explicit variant coverage today.

### Typed error matching (Terminal Arm Rule)

The language design also includes a statement form of `match` used for
*typed errors* (`docs/language/typed-errors.md`).

Surface form:

```silk
match (expr) {
  pattern => { ... },
  err: SomeError => { std::abort(); }
}
```

Key semantic rule (Terminal Arm Rule):

- If `expr` is an error-producing expression (its signature includes `T | ErrorType...`),
  then any arm that matches an `error` type must end in a terminal statement.

Current behavior:

- The compiler currently implements `match` as an expression for the documented
  surface:
  - optionals (`T?`),
  - primitive integers,
  - type unions,
  - recoverable `Result`-style values,
  - and exhaustive enum matches.
- No match arm guards (`pattern if cond => ...`) are implemented yet in either
  expression or statement form.
- The statement form is implemented for:
  - ordinary values in the supported subset (block arms), and
  - typed errors (`docs/language/typed-errors.md`).

Note: the compiler also allows the `match` statement form to destructure
recoverable `Result`-style values. This form does not trigger the Terminal Arm
Rule because it is not a `T | ...` typed-error expression.

### Result Matching (`Ok(...)` / `Err(...)`)

The `match` expression also supports a small subset for
recoverable “success or error” values. This includes:

- `std::result::Result(T, E)` (an `enum` with `Ok(T)` and `Err(E)` variants), and
- “Result-like” structs of the form `{ value: T?, err: E? }`.

For the struct form, the runtime invariant is: exactly one of `value` and `err`
is `Some(...)`. If this invariant is broken at runtime, execution traps.

Patterns:

- `Ok(name)` / `Ok(_)`
- `Err(name)` / `Err(_)`

Rules:

- Enum form:
  - The scrutinee expression must have an enum type with variants `Ok` and `Err`.
  - `Ok(...)` / `Err(...)` patterns are shorthand for `R::Ok(...)` / `R::Err(...)` where `R`
    is the scrutinee enum type, and may appear alongside other enum variant patterns.
  - In expression form, exhaustiveness follows the enum rules: there must be
    exactly one arm per enum variant.
- Struct form:
  - The scrutinee expression must have a nominal struct type that contains
    `value: T?` and `err: E?`.
- Matches must be exhaustive:
  - for enum scrutinees in expression form, follow the enum rules (one arm per
    variant),
  - for struct scrutinees, there must be exactly one `Ok(...)` arm and exactly
    one `Err(...)` arm.
- No guards are implemented for result arms either:
  - `Ok(v) if cond => ...`
  - `Err(e) if cond => ...`
- In `Ok(v) => ...`, the binder `v` has type `T`.
- In `Err(e) => ...`, the binder `e` has type `E`.

Until guards land, write the condition inside the selected arm body:

```silk
let s: String = match String.from_string("hello") {
  Ok(v) => if v.len > 0 { v } else { String.empty() },
  Err(_) => String.empty(),
};
```

Example:

```silk
import std::result;
import std::strings::String;

fn main () -> int {
  let s: String = match String.from_string("hello") {
    Ok(v) => v,
    Err(_) => String.empty(),
  };
  return s.len as int;
}
```

One-arm statement examples:

```silk
match (parse_port(input)) {
  Ok(port) => {
    use_port(port);
  },
}
```

```silk
match (std::env::get("HOME")) {
  None => {
    std::io::println("HOME is not set");
  },
}
```
