# `match` Expression

The `match` expression provides structured pattern matching.

Key ideas:

- A `match` selects one of several branches based on a scrutinee expression.
- Patterns and guards are defined as per the language specification in `docs/language/`.
- `match` is an expression; all arms must be compatible in type.

The compiler must:

- Enforce exhaustiveness rules (where specified).
- Type check each arm and compute a consistent result type.

## Surface Syntax (Initial Implemented Subset)

The full language design includes rich pattern matching, guards, and matching
over many scrutinee types. The current compiler implementation supports only a
narrow, explicitly documented subset so we can validate end-to-end lowering and
code generation.

In the initial subset, `match` is accepted as an *expression* of the form:

```silk
match <scrutinee> {
  <pattern> => <expr>,
  <pattern> => <expr>,
}
```

Notes:

- Arms are separated by commas; a trailing comma is permitted.
- In the initial subset, arm bodies are expressions (not blocks).

### Optional Matching (`T?`)

The currently implemented pattern subset is limited to optionals:

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

### Enum Matching (`enum`) (Implemented Subset)

The language design supports matching over user-defined `enum` types
(`docs/language/enums.md`).

Implemented initial subset:

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
- Matches must be exhaustive for the enum scrutinee in the initial subset:
  there must be exactly one arm for each enum variant (order is not
  significant).

### Type Union Matching (`T1 | T2 | ...`) (Implemented Subset)

The language supports matching over **type unions** (`docs/language/type-unions.md`).

Implemented initial subset:

- The scrutinee expression must have a union type `T1 | ... | Tn`.
- Patterns are restricted to typed binders:
  - `name: Ti` (binds the payload as `Ti`), or
  - `_: Ti` (matches and ignores the payload),
  where `Ti` is one of the union member types.
- No guards (`if ...`) are implemented yet.
- Matches must be exhaustive: there must be exactly one arm per union member
  type (order is not significant).

## Semantics (Initial Subset)

- The scrutinee expression is evaluated exactly once.
- The selected arm is chosen based on the scrutinee value; non-selected arms
  are not evaluated.
- For `Some(v) => ...`, the binder `v` is in scope only within that arm and has
  type `T` (the inner payload type of the scrutinee `T?`).
- The result type of a `match` expression is the common type of its arms; all
  arms must type-check to the same result type in the initial subset.

## `match` Statement (Typed Errors)

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

Implementation status:

- The compiler currently implements `match` as an expression for:
  - the optional subset (`T?`), and
  - exhaustive `enum` matches (no guards) for the current CFG IR backend subset.
- The statement form required for typed errors is implemented as part of the
  typed errors feature work and is described in `docs/language/typed-errors.md`.

Note: the compiler also allows the `match` statement form to destructure
recoverable `Result`-style values. This form does not trigger the Terminal Arm
Rule because it is not a `T | ...` typed-error expression.

### Result Matching (`Ok(...)` / `Err(...)`) (Implemented Subset)

The `match` expression also supports a small subset for
recoverable “success or error” values. In the initial subset, this includes:

- `std::result::Result(T, E)` (an `enum` with `Ok(T)` and `Err(E)` variants), and
- “Result-like” structs of the form `{ value: T?, err: E? }`.

For the struct form, the runtime invariant is: exactly one of `value` and `err`
is `Some(...)`. If this invariant is broken at runtime, execution traps.

Patterns:

- `Ok(name)` / `Ok(_)`
- `Err(name)` / `Err(_)`

Rules (current subset):

- Enum form:
  - The scrutinee expression must have an enum type with variants `Ok` and `Err`.
  - `Ok(...)` / `Err(...)` patterns are shorthand for `R::Ok(...)` / `R::Err(...)` where `R`
    is the scrutinee enum type, and may appear alongside other enum variant patterns.
  - Exhaustiveness follows the enum rules: there must be exactly one arm per enum variant.
- Struct form:
  - The scrutinee expression must have a nominal struct type that contains
    `value: T?` and `err: E?`.
- Matches must be exhaustive:
  - for enum scrutinees, follow the enum rules (one arm per variant),
  - for struct scrutinees, there must be exactly one `Ok(...)` arm and exactly one `Err(...)` arm.
- In `Ok(v) => ...`, the binder `v` has type `T`.
- In `Err(e) => ...`, the binder `e` has type `E`.

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

## Tests

- Optional `match` expressions:
  - `tests/silk/pass_optional_match_unwrap_int.slk`
- Enum `match` expressions:
  - `tests/silk/pass_enum_unit_match_int.slk`
  - `tests/silk/pass_enum_tuple_match_int.slk`
  - `tests/silk/pass_enum_tuple_match_struct_payload.slk`
  - `tests/silk/pass_enum_tuple_match_pair_underscore.slk`
  - `tests/silk/fail_enum_match_non_exhaustive.slk`
- Union `match` expressions:
  - `tests/silk/pass_type_union_match_struct_payload.slk`
  - `tests/silk/pass_type_union_match_struct_payload_different_shapes.slk`
  - `tests/silk/pass_type_union_match_error_payload_different_shapes.slk`
  - `tests/silk/pass_type_union_superset_tag_remap_primitive.slk`
  - `tests/silk/pass_type_union_superset_tag_remap_struct.slk`
  - `tests/silk/pass_type_union_superset_payload_widen_mixed.slk`
- Result-like `match` expressions:
  - `tests/silk/pass_result_match_expr_string.slk`
  - `tests/silk/pass_result_match_expr_f64.slk`
  - `tests/silk/pass_result_match_expr_shorthand_int.slk`
- Typed error-handling `match` statements:
  - `tests/silk/pass_typed_errors_success.slk`
  - `tests/silk/pass_typed_errors_abort.slk`
