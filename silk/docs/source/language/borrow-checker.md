# Borrow Checking (Static Alias and Lifetime Safety)

This document specifies Silk’s intended borrow-checking model for references.

Status: **partially implemented**. The current compiler subset implements:

- call-scoped alias checks for mutable borrows (including slice range borrows),
- lexical lifetime checks for slice and reference borrows (no escaping borrows
  of stack locals),
- and a small explicit ownership-transfer form (`move`) used by the checker and
  lowering to prevent accidental double-drops in the safe subset.

## Goals

- Prevent use-after-free and data races in safe code.
- Make mutation explicit and intentional.
- Reject invalid borrows at compile time (no runtime borrow errors required for
  safe code).
- Keep diagnostics actionable (highlight the borrow origin, conflicting use,
  and suggest a fix).

## Current Implemented Subset

Today, the language subset implemented by the compiler supports only:

- call-scoped borrow alias checks for:
  - borrowed reference parameters (`&T`, `mut p: &T`), and
  - slice parameters (`T[]`, `mut s: T[]`) and slice range borrows
    (`&base[start..end]`, `mut &base[start..end]`, and `&base[r]` / `mut &base[r]`
    where `r: range`).
- first-class borrowed `&Struct` values created from borrowable lvalues:
  - `&expr` (borrow operator) for borrowable lvalues, and
  - implicit borrow coercions in contexts that expect `&T`
    (for example `let r: &Pair = pair;`).

Additionally, the subset implements **lexical lifetime checks** for both slice
borrows and borrowed `&T` values so obvious use-after-scope cases are rejected
(for example returning a slice borrowed from a local fixed array, or returning
`&T` borrowed from a local struct binding).

## Lexical Lifetimes (Implemented Subset)

Slices (`T[]`) are non-owning views. Slice range borrows create slices that
point into existing storage:

- `&base[start..end]` creates a slice view whose lifetime is tied to `base`.
- `&base[r]` creates a slice view whose bounds are defined by the `range` value
  `r` (see `docs/language/types.md`).
- When borrowing a range from an existing slice binding `s: T[]`, the borrow’s
  underlying origin is `s`’s origin (sub-slicing does not extend lifetime).

Lexical lifetime rules enforced by the current compiler subset:

- A slice value that ultimately borrows from a **local fixed array binding**
  (`T[N]`) may not escape that binding’s lexical scope.
  - Returning such a slice from a function is rejected.
  - Assigning such a slice into outer-scope storage is rejected (including via
    field assignment and via mutable reference parameters).
- Returning a slice is permitted when the returned slice ultimately borrows
  from a **function parameter** (for example returning a sub-slice of a `T[]`
  parameter).

These rules are intentionally conservative and are expected to be generalized
to a richer lifetime model as more borrow forms become first-class.

## Lexical Reference Lifetimes (Implemented Subset)

Borrowed `&T` values that ultimately reference **stack storage** may not escape
that storage’s lexical scope. This includes:

- returning a borrowed `&T` that points to a local struct binding,
- and assigning such a borrowed reference into outer-scope storage.

Returning a reference is permitted when the returned `&T` ultimately refers to
an input reference parameter (that is, storage owned by the caller), and not to
stack locals.

## Ownership Transfer (`move`) (Implemented Subset)

Silk’s safe subset includes a small explicit ownership-transfer form:

- `move <name>`

This expression:

- consumes the binding `<name>` when its type requires ownership tracking
  (for example values that are dropped on scope exit),
- and makes `<name>` unavailable for further use until it is reinitialized
  (for `var`) or permanently (for `let`).

This enables moving values into other values (for example as call arguments or
as the payload of `Some(...)`) without accidentally copying a resource-owning
value and dropping it twice.

In the current subset, ownership transfer is intentionally conservative:

- A binding may not be moved while it has any live borrows (reference or slice
  views) in scope, including borrows stored in struct fields.
- A by-value call argument that requires ownership tracking is treated as a
  move, and is rejected when the same binding is also borrowed in that call.
- When a value type requires ownership tracking, binding initialization and
  assignment from a name are also treated as moves:
  - `let y = x;` consumes `x`,
  - `y = x;` consumes `x`.

## Planned Expansion

As the language grows, borrow checking is expected to expand to cover:

- borrowed references as first-class values (`&expr` producing `&T` values),
- references and borrows in more positions (locals, fields, returns),
- lifetime/region inference across control flow,
- explicit disambiguation when multiple input references exist (for example a
  label syntax like `as A` to tie a return reference to a specific input),
- restrictions around suspension points in `async`/`await`,
- and well-defined rules for passing references across FFI boundaries.

Any expansion must be specified in `docs/language/grammar.md` and in this
document before implementation lands, and must be reflected in diagnostics
(`docs/compiler/diagnostics.md`) and tests.
