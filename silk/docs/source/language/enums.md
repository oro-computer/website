# `enum` Types

An `enum` defines a *tagged union* type: a value that is exactly one of several
named variants, optionally carrying a payload.

Use enums to model:

- finite state machines (connection state, parser state),
- protocol messages and events,
- and any API where “exactly one of these cases” is the core invariant.

If your goal is “a function can fail with one of several error shapes”, prefer
typed errors (`docs/language/typed-errors.md`) over enums.

## Implementation Status (Current Compiler Subset)

What works end-to-end today (parser → checker → lowering → codegen):

- **Enum declarations** with:
  - unit variants (`A`),
  - tuple variants (`Data(int)` and `Pair(int, int)`),
  - and an optional trailing comma after the last variant.
- **Construction**:
  - unit variants as values: `E::A`,
  - tuple variants as calls: `E::Data(7)`.
  - type-directed shorthand:
    - when the expected type is an enum `E`, unit variants may be written as `A`
      (sugar for `E::A`),
    - when the expected type is an enum `E`, tuple variants may be written as
      `Data(7)` (sugar for `E::Data(7)`).
- **Function signatures**:
  - enums may be used in parameter lists and return types,
  - error-producing functions may return enums (`-> E | ErrorType...`), and `call()?` works when the success type is an enum.
- **`match` expression over enums**:
  - patterns are restricted to enum variants (`E::A`, `E::Data(x)`) and may use shorthand (`A`, `Data(x)`) when the scrutinee type is the enum,
  - binders may be names or `_`,
  - no guards (`if ...`) yet,
  - and matches must be *exhaustive* in the current subset.
- **Generic enums (monomorphized)**:
  - `enum Name(T, ...) { ... }` declarations are supported in module-set builds
    that run monomorphization,
  - instantiated enums behave like ordinary enums once referenced (including
    construction and `match`),
  - callers typically introduce a local type alias for the instantiated enum
    (for example `type R = Result(int, string);`) and then use `R::Ok(...)` /
    `R::Err(...)` as constructors and patterns.
- **`impl` blocks on enums**:
  - enums may have `impl` blocks (including generic `impl EnumName(T, ...)`),
  - static methods are callable as `EnumName.method(...)` (including through
    type aliases for instantiated generic enums),
  - instance methods are callable as `value.method(...)` when the first
    parameter is a receiver (`self: &EnumName` / `mut self: &EnumName`),
  - the special `constructor` method used by `new Type(...)` is for `struct`
    types; enums do not support `constructor` methods in the current subset.

Not implemented yet (or not yet stable/documented):

- Guards in enum match arms (`E::A if cond => ...`).
- Wildcard/catch-all enum match arms (`_ => ...`).
- A stable ABI story for passing/returning enums across the C99 boundary (do
  not assume an enum layout until it is specified in `docs/compiler/abi-libsilk.md`).

When the compiler rejects an enum construct in the current subset, the most
common error is `E2002` (“unsupported expression in the current subset”). Type
mismatches inside enum constructors or match arms are `E2001` (“type mismatch”).

## Surface Syntax

Enum declarations introduce a nominal type and its variants:

```silk
enum RecvJob {
  Msg(Job),
  Cancelled,
  Timeout,
}
```

Rules:

- Variant names are identifiers and must be unique within the enum.
- Variant names may not be the reserved optional constructors `Some` / `None`.
- An enum must declare at least one variant.
- A variant is either:
  - a **unit** variant (no payload): `Cancelled`,
  - or a **tuple** variant with one or more payload element types: `Msg(Job)`,
    `Pair(int, int)`.
- A trailing comma after the last variant is permitted.

## Construction

### Unit variants

Unit variants are constructed as values using `Enum::Variant` (or, in
type-directed contexts, just `Variant`):

```silk
enum E {
  A,
  B,
}

fn main () -> int {
  let x: E = E::A;
  let y: E = A;
  return 0;
}
```

Notes:

- `E::A()` and `A()` are invalid in the current subset (unit variants are not callable).

### Tuple variants

Tuple variants are constructed using `Enum::Variant(<args...>)` where the
argument count and types match the variant’s declared payload element types:

```silk
enum E {
  Data(int),
  Pair(int, int),
  Empty,
}

fn main () -> int {
  let a: E = E::Data(7);
  let b: E = Data(7);
  let b: E = E::Pair(1, 2);
  let c: E = E::Empty;
  return 0;
}
```

Notes:

- `E::Data` by itself is not a value in the current subset (tuple variants must
  be constructed with `(...)`).
- If a tuple-variant constructor argument has the wrong type, you get `E2001`.
- If the argument count does not match the variant definition, the compiler
  currently rejects the construct with `E2002`.

### Generic enums (instantiation via alias)

When an enum is generic, callers typically alias an instantiation and then use
that alias as the qualifier for constructors:

```silk
enum Result(T, E) {
  Ok(T),
  Err(E),
}

type R = Result(int, int);

fn main () -> int {
  let x: R = R::Ok(123);
  return match x {
    R::Ok(v) => v,
    R::Err(_) => 0,
  };
}
```

### Namespaced enums (packages)

Across packages, enums and variants may be referenced with `::` qualification.
For example, if `util` defines `enum Mode { Inc, Dec }`, an importer can write:

- `util::Mode` as the type name, and
- `util::Mode::Inc` / `util::Mode::Dec` as the constructors and patterns.

See `docs/language/packages-imports-exports.md` for module-set rules and for how
package imports seed qualified type names.

## Matching

Enum values are typically consumed via `match` expressions. The `match`
expression rules are defined in `docs/language/flow-match.md`; this section
focuses on the enum-specific subset.

### Patterns

Enum patterns are variant patterns:

- Unit variant: `E::A`
- Tuple variant: `E::Data(x)`, `E::Pair(a, b)`
- Tuple binder omission: `E::Pair(_, b)` (underscore binder ignores that element)

Shorthand:

- When the scrutinee type is the enum `E`, the qualifier may be omitted:
  - Unit variant: `A`
  - Tuple variant: `Data(x)`, `Pair(a, b)`

For instantiated generic enums, the qualifier `E` may be a type alias (for
example `type R = Result(int, string);` then `R::Ok(v)` / `R::Err(e)`).

Binders:

- introduce a name scoped to that arm only, and
- shadow outer bindings of the same name (because they create a new binding in
  the arm’s environment).

### Exhaustiveness (current subset)

In the current subset, enum matches must be exhaustive:

- There must be exactly one arm per enum variant.
- Each variant must appear exactly once.
- Wildcard arms (`_ => ...`) are not supported for enum matches yet.

If a match is not exhaustive, the compiler currently reports `E2002` rather than
a dedicated “missing match arm” diagnostic.

### Example: unit enum match

```silk
enum E {
  A,
  B,
}

fn main () -> int {
  let v: E = E::A;

  let x: int = match v {
    E::A => 10,
    E::B => 20,
  };

  if x != 10 {
    return 1;
  }
  return 0;
}
```

### Example: tuple enum match (payload binders)

```silk
enum E {
  Pair(int, int),
  Empty,
}

fn main () -> int {
  let v: E = E::Pair(1, 2);

  let x: int = match v {
    E::Pair(a, _) => a,
    E::Empty => 0,
  };

  if x != 1 {
    return 1;
  }
  return 0;
}
```

### Example: struct payload enum match

```silk
struct Job {
  id: int,
}

enum RecvJob {
  Msg(Job),
  Cancelled,
}

fn main () -> int {
  let j: Job = Job{ id: 5 };
  let evt: RecvJob = RecvJob::Msg(j);

  let rc: int = match evt {
    RecvJob::Msg(job) => job.id,
    RecvJob::Cancelled => 0,
  };

  if rc != 5 {
    return 1;
  }
  return 0;
}
```

## Representation (Current Backend Subset)

Enums are values. In the current IR-backed lowering, an enum value is lowered to
scalar slots as:

1. a `u64` **tag** (variant index in declaration order, starting at `0`), and
2. a **payload region** that includes a distinct slot range for each variant’s
   payload elements, in variant declaration order.

Conceptually:

```text
(u64 tag,
 payload slots for variant 0,
 payload slots for variant 1,
 ...)
```

Only the active variant’s payload region is meaningful for a given value; other
payload regions are unspecified.

This representation is an implementation detail and is expected to evolve (for
example, toward a tag + max-payload “union-style” layout) as the compiler and
ABI mature.

## Common Pitfalls

- **Forgetting parentheses**: `E::Data(7)` is valid, but `E::Data` is not a value
  in the current subset (error `E2002`).
- **Calling a unit variant**: `E::A` is a value; `E::A()` is rejected (`E2002`).
- **Wrong binder count**: `E::Pair(a)` does not match `Pair(int, int)` (`E2002`).
- **Non-exhaustive matches**: you must list every variant (error `E2002` in the
  current subset).
- **Assuming enum equality is defined**: use `match` to inspect the tag/payload;
  the current backend subset does not define `==`/`!=` over enums yet.

## Related Documents

- `docs/language/flow-match.md` (match expression rules)
- `docs/language/structs-impls-layout.md` (struct payloads)
- `docs/language/types.md` (nominal types and type annotations)
- `docs/language/packages-imports-exports.md` (namespaces and imports)
- `docs/language/typed-errors.md` (typed errors, not enums)

## Tests

- Enum matches (end-to-end):
  - `tests/silk/pass_enum_unit_match_int.slk`
  - `tests/silk/pass_enum_tuple_match_int.slk`
  - `tests/silk/pass_enum_tuple_match_struct_payload.slk`
  - `tests/silk/pass_enum_tuple_match_pair_underscore.slk`
  - `tests/silk/fail_enum_match_non_exhaustive.slk`
- Namespaced enum references (module-set build):
  - `tests/silk/pass_import_pkg_util.slk` (built with `tests/silk/support_pkg_import_util.slk`)
