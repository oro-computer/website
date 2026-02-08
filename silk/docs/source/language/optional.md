# Optional

The `Optional` type provides a safe way to represent values that may or may not
be present, instead of relying on sentinel values such as `null`.

- The nominal type constructor is `Option(T)`.
- The shorthand `T?` is sugar for `Option(T)` and is the recommended form.
- Optional values are constructed using `Some(...)` and `None` (the compiler
  also accepts `none` as an alias of `None`).
- The `null` literal is distinct from `None`, but may coerce to `None` when an
  optional type is expected.
- Use `match`, `?.` (optional chaining), and `??` (coalescing) to consume optionals.

## Declaring Optional Types

You can declare variables or fields as optional using either:

- `T?` (idiomatic suffix form),
- `Option(T)` (nominal form).

The language design treats these as equivalent.

Implementation status:

- The type system (`src/types.zig`) models optional types, and the parser
  now accepts both:
  - the suffix form `T?` in type annotations, and
  - the nominal form `Option(T)` for simple cases (a single type argument),
    which is desugared into the same internal optional representation as
    `T?`.
  - For example, the following is valid today and type-checks successfully
    (note that the current compiler requires `let` initializers; see
    `docs/compiler/diagnostics.md`, `E2015`):

    ```silk
    fn main () -> int {
      let a: string? = None;
      let b: Option(string) = None;
      return 0;
    }
    ```

- The current `linux/x86_64` IR→ELF backend subset now supports a first slice
  of optional *values* for a subset of payload types:
  - construct optionals via `None` and `Some(value)`,
  - access fields of optional structs via optional chaining
    (`opt?.field`, producing a `FieldType?` value),
  - use nested optionals (`T??`) for a subset of payloads in the current backend
    (see below),
  - compare supported optionals via `==` / `!=` (tag + payload equality; nested
    optionals compare recursively),
  - unwrap optionals via `??` (coalescing) with short-circuit evaluation of
    the fallback expression,
  - explicitly branch on optionals via the `match` expression (see
    `docs/language/flow-match.md`),
  - and pass/return such optionals between helpers in the supported IR
    subset.

  Supported optional payloads in this backend subset include:

  - scalars (`bool`, `char`, `f32`, `f64`, `int`, and fixed-width integers),
  - `string` (lowered as `{ ptr: u64, len: i64 }`),
  - enums (tagged unions) in the current enum backend subset (lowered as `(u64 tag, payload_0, payload_1, ...)`),
  - and the supported `struct` subset (0+ fields of supported value types,
    including nested structs and optionals; see `docs/language/structs-impls-layout.md`).

  In this subset, optionals are represented at IR boundaries as a `Bool` tag
  followed by the payload scalars: `(Bool tag, payload0, payload1, ...)` where
  `tag=0` means `None` and `tag=1` means `Some(...)`. The payload scalar slots
  follow the same lowering rules as the underlying non-optional type (1 scalar
  for scalar payloads, 2 scalars for `string`, N scalars for the current `struct`
  subset, and N scalars for enums (including the enum’s own `u64` tag slot).

  Nested optionals (`T??`) are supported in this backend subset for the same
  payload subset (scalars, `string`, enums, and the supported `struct` subset).

  In this subset, `T??` is represented as an outer optional whose payload is
  the full inner optional representation: for example `int??` lowers as
  `(Bool tag0, Bool tag1, i64 payload)`.

- Not yet implemented:
  - optional chaining beyond the current optional-struct field access subset
    (for example chaining through optional fields, optional method calls, and
    optional indexing),
  - `match` over non-optional scrutinee types (and richer pattern forms beyond
    `None`/`Some(...)`),
  - and richer optional forms beyond the current backend subset.

Note: optional payload equality (`==` / `!=`) is still limited in the current
backend subset; comparisons against `None` are supported broadly, but full
payload equality for all optional payload kinds (notably optional-of-enum) is
still evolving.

For the current C ABI mapping of optionals in exported function signatures
within the supported backend subset, see `docs/compiler/abi-libsilk.md` and
`docs/language/ext.md`.

## Creating Optional Values

An optional can be:

- `None` — the empty state.
- `Some(value)` — the value‑holding state.

Examples from the spec:

- `let age: u32? = None;`
- `let age: u32? = Some(30);`
- `struct User = { profile: None };`
- `profile: Some({ email: "some@example.com", age: Some(30) })`

The compiler infers the optional’s element type from context when possible.

Equality comparisons provide optional type
context for `None` / `Some(...)` operands, so forms like `opt == None` and
`opt == Some(value)` type-check when `opt` has type `T?`.

## `None`: The Empty State

`None` represents the absence of a value.

Spelling note: `None` may also be written as `none` (alias). The `null` literal
is a distinct literal that can coerce to `None` in optional contexts.

Key points:

- `None` can be assigned to any `T?`; its concrete `T` is inferred.
- In pattern matching and control flow, `None` corresponds to the empty branch.

## `Some(value)`: The Value-Holding State

`Some(value)` wraps a concrete value in an `Option(T)`.

Key points:

- The type of `Some(value)` is `T?` (or `Option(T)`).
- Nested optionals are allowed (e.g. a struct containing fields that are `T?`).

## Optional-Coalescing Operator `??`

The `??` operator unwraps an optional by providing a fallback value if it is `None`.

From the spec:

- It “coalesces” the optional’s value and the default into a single, non‑optional result.
- The expression `opt ?? default_value` has type `T` when `opt` has type `T?`.
- When `opt` has type `T??`, the expression `opt ?? default_value` has type
  `T?` (it unwraps one optional layer).
- It composes naturally with optional chaining.

Example:

- `let email_address: string = user2.profile?.email ?? "no-email-provided@domain.com";`

## Using Optional Values

The spec provides several mechanisms for working with optionals:

- Optional chaining `?.`:
  - `user.profile?.email` yields `string?`.
  - If any link in the chain is `None`, the result is `None`.
- Coalescing `??`:
  - Converts an optional into a non‑optional by supplying a default.
- Explicit checking via `match`:
  - Pattern‑matching on `Some(...)` / `None` to handle both cases explicitly.

## Compiler Requirements

The compiler must:

- Support `T?` and `Option(T)` as equivalent surface forms.
- Ensure that `Some` / `None` usage is type‑correct.
- Track optionality in the type system and enforce checks when unwrapping.
- Implement `?.` and `??` with the short‑circuit semantics described above.
- Support `match` on `Option(T)` and integrate optionals with flow control and error reporting.
