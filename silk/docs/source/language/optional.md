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

Implementation

- The type system (`src/types.zig`) models optional types, and the parser
 now accepts both:
 - the suffix form `T?` in type annotations, and
 - the nominal form `Option(T)` for simple cases (a single type argument),
 which is desugared into the same internal optional representation as
 `T?`.
 - For example, the following is valid today and type-checks successfully
 (note that the current compiler requires `let` initializers; see
 [diagnostics](?p=compiler/diagnostics), `E2015`):

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
 - call methods on optional structs via optional chaining
 (`opt?.method(args)`, producing a `ResultType?` value),
 - use nested optionals (`T??`) for a subset of payloads in the current backend
 (see below),
 - compare supported optionals via `==` / `!=` (tag + payload equality; nested
 optionals compare recursively),
 - unwrap optionals via `??` (coalescing) with short-circuit evaluation of
 the fallback expression,
 - explicitly branch on optionals via the `match` expression (see
 [flow match](?p=language/flow-match)),
 - and pass/return such optionals between helpers in the supported IR
 subset.

 Supported optional payloads in this backend subset include:

 - scalars (`bool`, `char`, `f32`, `f64`, `int`, and fixed-width integers),
 - `string` (lowered as `{ ptr: u64, len: i64 }`),
 - enums (tagged unions) in the current enum backend subset (lowered as `(u64 tag, payload_0, payload_1, ...)`),
 - and the supported `struct` subset (0+ fields of supported value types,
 including nested structs and optionals; see [structs impls layout](?p=language/structs-impls-layout)).

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
 - optional chaining beyond the current optional-struct field access and
 optional method call subsets (for example chaining through optional fields
 and optional indexing),
 - `match` over non-optional scrutinee types (and richer pattern forms beyond
 `None`/`Some(...)`),
 - and richer optional forms beyond the current backend subset.

Note: optional payload equality (`==` / `!=`) is still limited in the current
backend subset; comparisons against `None` are supported broadly, but full
payload equality for all optional payload kinds (notably optional-of-enum) is
still evolving.

For the current C ABI mapping of optionals in exported function signatures
within the supported backend subset, see [abi libsilk](?p=compiler/abi-libsilk) and
[ext](?p=language/ext).

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

Scope note:

- `??` is primarily the optional-coalescing operator.
- The same token is also used for recoverable `Result`-like values:
 `result ?? fallback` yields the `Ok(...)` payload or the fallback for
 `Err(...)`.
- The same token is also used for ordinary named enums with exactly two
 declared variants:
 - if the first declared variant is unit, `value ?? fallback` yields that enum
 value,
 - if the first declared variant carries exactly one payload, it yields that
 payload,
 - and if the value is the second declared variant, `fallback` is evaluated.
- The right-hand side may also be one of the narrow terminal control-flow
 forms accepted only after `??`:
 - `value ?? return expr`
 - `value ?? break`
 - `value ?? continue`
- These forms keep the same validity rules as their statement counterparts:
 - `return` must be valid in the enclosing function and type-check against its
 result type,
 - `break` and `continue` are only valid inside loops.
- This is still a narrow rule for coalescing. It does not make `return`,
 `break`, or `continue` general expressions elsewhere in the language.
- The optional and recoverable-result forms are distinguished by the left-hand
 operand type; expression `match` remains the more general payload-aware tool
 when you need explicit names, multiple payload elements, or more than two
 states.

Examples:

```silk
fn read_port () -> int {
  let port: int = maybe_port() ?? return 80;
  return port;
}

fn drain () -> int {
  let mut seen: int = 0;
  loop {
    let value: int = next_value() ?? break;
    seen = value;
  }
  return seen;
}

fn scan (values: int?[]) -> int {
  let mut found: int = 0;
  for item in values {
    let value: int = item ?? continue;
    found = value;
  }
  return found;
}
```

## Using Optional Values

The spec provides several mechanisms for working with optionals:

- Optional chaining `?.`:
 - `user.profile?.email` yields `string?`.
 - If any link in the chain is `None`, the result is `None`.
 - Optional method calls are also supported:
 - `user.profile?.email_len()` yields `int?`.
 - When the receiver is `Some(v)`, the call evaluates as `Some(v.email_len())`.
 - When the receiver is `None`, the call evaluates as `None`.
- Coalescing `??`:
 - Converts an optional into a non‑optional by supplying a default.
- Explicit checking via `match`:
 - Pattern‑matching on `Some(...)` / `None` to handle both cases explicitly.

## Optional combinators (methods)

In addition to `match`, `?.`, and `??`, the compiler provides a small set of
combinator methods on optional values (`T?`). These are designed to feel
familiar to Rust developers while preserving Silk’s explicit move/cleanup rules
([memory model](?p=language/memory-model)).

Supported methods (Supported forms):

- `opt.is_some() -> bool`
- `opt.is_none() -> bool`
- `opt.map(f) -> U?` where `f: fn(T) -> U`
- `opt.and_then(f) -> U?` where `f: fn(T) -> U?`
- `opt.or_else(f) -> T?` where `f: fn() -> T?`
- `opt.unwrap_or(fallback) -> T` (eager; `fallback` is evaluated before the call)
- `opt.unwrap_or_else(f) -> T` where `f: fn() -> T` (lazy; called only for `None`)

Notes:

- `??` remains the idiomatic lazy fallback operator because the fallback is an
 ordinary expression and is evaluated only for `None`.
- `unwrap_or` is eager by design; use `unwrap_or_else` (or `??`) when the
 fallback is expensive.
- `map`/`and_then` call the callback only for `Some(...)`.

Example (`map` + `and_then`):

```silk
import result from "std/result";

fn parse_port (s: string) -> result::Result(int, int) {
  return Ok(123);
}

fn main () -> int {
  let maybe: string? = Some("8080");
  let port_opt: int? = maybe.and_then(fn (s: string) {
    return parse_port(s).ok_value();
  });
  return port_opt.unwrap_or(0);
}
```

## Compiler Requirements

The compiler must:

- Support `T?` and `Option(T)` as equivalent surface forms.
- Ensure that `Some` / `None` usage is type‑correct.
- Track optionality in the type system and enforce checks when unwrapping.
- Implement `?.` and `??` with the short‑circuit semantics described above.
- Support `match` on `Option(T)` and integrate optionals with flow control and error reporting.
