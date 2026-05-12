# Borrow Checking (Static Alias and Lifetime Safety)

This document specifies Silk’s intended borrow-checking model for references.

Silk currently implements:

- call-scoped alias checks for mutable borrows (including slice range borrows),
- lexical lifetime checks for slice and reference borrows (no escaping borrows
 of stack locals),
- and a small explicit ownership-transfer form (`move`) used by the checker and
 lowering to prevent accidental double-drops in the safe subset.

## Semantics

- Prevent use-after-free and data races in safe code.
- Make mutation explicit and intentional.
- Reject invalid borrows at compile time (no runtime borrow errors required for
 safe code).
- Keep diagnostics actionable (highlight the borrow origin, conflicting use,
 and suggest a fix).

## Notes

Today, the language subset implemented by the compiler supports only:

- call-scoped borrow alias checks for:
 - borrowed reference parameters (`&T`, `mut p: &T`), and
 - slice parameters (`T[]`, `mut s: T[]`) and slice range borrows
 (`&base[start..end]`, `mut &base[start..end]`, and `&base[r]` / `mut &base[r]`
 where `r: range`).
- first-class borrowed `&T` values created from borrowable lvalues:
 - `&expr` (borrow operator) for borrowable lvalues, for:
 - the supported `&Struct` subset, and
 - `&T` where `T` is a single-slot scalar primitive (for example `&int`,
 `&bool`, `&u64`, `&f64`).
 - implicit borrow coercions in contexts that expect `&T` are currently
 implemented for `&Struct` (for example `let r: &Pair = pair;`).

Additionally, the subset implements **lexical lifetime checks** for both slice
borrows and borrowed `&T` values so obvious use-after-scope cases are rejected
(for example returning a slice borrowed from a local fixed array, or returning
`&T` borrowed from a local struct binding).

The currently shipped subset therefore already includes borrowed views in the
positions that matter most for day-to-day code:

- local `&T` and `T[]` bindings,
- local `T?` bindings whose payload is a borrowed `&T` or `T[]`,
- struct fields and enum payloads that carry borrowed views,
- assignments through fields and mutable reference parameters,
- and whole-value returns / assignments that are checked against lexical escape
 rules even when the borrowed view is carried through an aggregate.

## Lexical Lifetimes

Slices (`T[]`) are non-owning views. Slice range borrows create slices that
point into existing storage:

- `&base[start..end]` creates a slice view whose lifetime is tied to `base`.
- `&base[r]` creates a slice view whose bounds are defined by the `range` value
 `r` (see [types](?p=language/types)).
- When borrowing a range from an existing slice binding `s: T[]`, the borrow’s
 underlying origin is `s`’s origin (sub-slicing does not extend lifetime).

Lexical lifetime rules enforced by Silk currently:

- A slice value that ultimately borrows from a **local fixed array binding**
 (`T[N]`) may not escape that binding’s lexical scope.
 - Returning such a slice from a function is rejected.
 - Assigning such a slice into outer-scope storage is rejected (including via
 field assignment and via mutable reference parameters).
- The same rule also applies when that borrowed slice is wrapped in `T?`
 (`Some(&xs[...])` does not allow the local borrow to escape).
- The same rule also applies when that borrowed slice is carried inside a
 struct field or enum payload; returning or assigning the aggregate does not
 allow the local borrow to escape.
- Returning a slice is permitted when the returned slice ultimately borrows
 from a **function parameter** (for example returning a sub-slice of a `T[]`
 parameter).

These rules are intentionally conservative, but they are the complete lexical
lifetime model for the currently supported language subset.

## Lexical Reference Lifetimes

Borrowed `&T` values that ultimately reference **stack storage** may not escape
that storage’s lexical scope. This includes:

- returning a borrowed `&T` that points to a local stack binding (struct or
 single-slot scalar),
- returning such a borrow wrapped in `T?`,
- returning such a borrow carried inside a struct field or enum payload,
- and assigning such a borrowed reference into outer-scope storage.

Returning a reference is permitted when the returned `&T` ultimately refers to
an input reference parameter (that is, storage owned by the caller), and not to
stack locals.

When multiple input references or slices are in scope, no explicit lifetime
label syntax is required in the current language. A returned borrowed view may
refer to any caller-owned input borrow that reaches the return expression
through the supported control-flow forms. If any path introduces a local stack
or fixed-array origin, the lexical escape check still rejects the return.

## Local Mutation While Borrowed

Silk currently also rejects direct mutation of ordinary local
storage while a borrow of that same storage remains live.

This applies to:

- whole-binding assignment (`x = ...`) when `x` is a local stack value or local
 fixed array,
- field assignment (`x.f = ...`) into a local aggregate that is still borrowed,
- and index assignment (`xs[i] = ...`) into a local fixed array that still has
 a live borrowed slice.

In other words, an ordinary local borrow freezes the borrowed local storage
against direct mutation until that borrow ends.

Writes performed through the unique mutable borrow itself remain allowed. For
example, mutation through `mut r: &T` is permitted when it is not competing
with a separate live borrow of the same local storage.

This rule is intentionally local-storage-specific. Borrowed access to
caller-owned or external-handle storage is governed by the existing boundary
rules instead.

## Borrow-Carrying Wrappers and Conservative Control Flow

The current checker also preserves borrow identity through a small set of
wrapper and control-flow forms:

- `Some(<borrow>)` preserves the underlying borrow identity.
- Local `T?` bindings whose payload type is `&T` or `T[]` participate in the
 same local mutation, lexical escape, move, and `await` checks as direct
 borrowed bindings.
- Local named struct / enum bindings whose fields or payloads carry `&T` or
 `T[]` also participate in the same local mutation, lexical escape, move, and
 `await` checks as direct borrowed bindings.
- Refutable-pattern binders also preserve borrow identity when the scrutinee
 already proves a single local borrow origin. In the Supported forms, this
 includes:
 - `if let Some(x) = r { ... }`
 - `let Some(x) = r else { ... };`
 - `while let Some(x) = r { ... }`
 - statement `match (r) { Some(x) => ..., None => ... }`
 where `r: T?` and `T` is a borrowed `&U` or `U[]`.
 - `if let Ok(x) = r { ... }` / `if let Err(x) = r { ... }`
 - `let Ok(x) = r else { ... };` / `let Err(x) = r else { ... };`
 - `while let Ok(x) = r { ... }` / `while let Err(x) = r { ... }`
 - statement `match (r) { Ok(x) => ..., Err(y) => ... }`
 for supported result-shaped enums whose payload type carries a borrow,
 including monomorphized `std::result::Result(T, E)` instantiations, and the
 equivalent qualified enum-variant forms such as `State::Ready(x)`.
- `if` expressions preserve borrow identity when:
 - every borrowing branch resolves to the same local origin,
 - or one branch is non-borrowing (`None`, for example) and the other carries
 the borrow,
 - or all borrowing branches are caller-owned inputs.
- `match` expressions preserve borrow identity under the same conservative
 rule:
 - every borrowing arm must resolve to the same local origin,
 - or one or more arms are non-borrowing while the remaining borrowing arms
 resolve to that same origin,
 - or all borrowing arms are caller-owned inputs.

When a borrowed control-flow expression could refer to multiple distinct local
origins, the Supported forms rejects it with `E2122` instead of guessing.

## Boundary Safety

The current compiler also enforces conservative rules at boundaries where a
borrowed view could outlive the storage it refers to.

### `async fn` boundaries

At an `async fn` boundary, the result type may not contain ordinary
borrowed-view types:

- non-opaque references (`&T`),
- and slices (`T[]`).

This includes such types nested inside structs, enums, optionals, and function
types. The reason is suspension: an `async fn` call returns a `Promise(T)`, so
the eventual result may outlive the stack frame that originally produced the
borrowed view.

Opaque handle references are allowed:

- `&Handle` is permitted when `Handle` is declared as an opaque `struct Name;`.

These are treated as external handles rather than borrow-checked views into
ordinary Silk storage.

Borrowed parameters are permitted in the Supported forms, but the checker also
enforces a conservative async call-site rule:

- an ordinary reference or slice that still resolves to function-local stack
 storage or a local fixed array may not be passed into an `async` call unless
 that call is awaited immediately in the same expression,
- opaque handle references remain allowed because they are not borrow-checked
 views into ordinary Silk storage.

This is the borrow model for the current async subset. Additional async surface
area must define equivalent suspension and escape rules before it lands.

### External ABI boundaries

At top-level external ABI boundaries, ordinary borrowed views are also
rejected:

- `ext` declarations may not use ordinary references or slices in parameters
 or results,
- unnamed/global-package top-level `export fn` declarations are subject to the same
 rule because they define the compiler’s C-facing symbol surface,
- only opaque handle references (`&Handle` where `Handle` is `struct Name;`)
 may cross that boundary.

This rule does not apply to ordinary impl/public methods inside Silk modules;
those remain normal intra-Silk calls.

### `await` suspension points

At a concrete `await` / `await *` suspension point inside an `async` function,
the checker also rejects live borrowed views that still resolve to ordinary
function-local storage:

- a borrowed reference (`&T`) that still points at a local stack value,
- a slice (`T[]`) that still points at a local fixed array,
- and either of the above when the borrowed view is stored in a local struct
 field instead of a standalone local binding.

This rule is intentionally conservative. It applies only to borrows rooted in
ordinary local Silk storage. The following remain allowed:

- borrowed views rooted in caller-owned storage that have already passed the
 boundary rules,
- and opaque handle references (`&Handle` where `Handle` is an opaque
 `struct Name;`).

The practical rule is: if an `await` may suspend, end any live borrow of local
stack / fixed-array storage before the suspension point.

### External ABI boundaries

At `ext` boundaries, the same borrowed-view restriction applies:

- ordinary references and slices may not cross the boundary,
- and only opaque handle references (`&Handle` where `Handle` is opaque) are
 permitted by reference.

This keeps Silk’s borrow rules out of the C ABI and avoids exposing non-stable
borrowed layouts to foreign code.

## Ownership Transfer (`move`)

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

In the Supported forms, ownership transfer is intentionally conservative:

- A binding may not be moved while it has any live borrows (reference or slice
 views) in scope, including borrows stored in struct fields.
- A by-value call argument that requires ownership tracking is treated as a
 move, and is rejected when the same binding is also borrowed in that call.
- When a value type requires ownership tracking, binding initialization and
 assignment from a name are also treated as moves:
 - `let y = x;` consumes `x`,
 - `y = x;` consumes `x`.
- `let move` / `var move` are the equivalent binding-level spellings for an
 explicit initialization-time move:
 - `let move y = x;` and `var move y = x;` consume `x` when `x` requires
 ownership tracking,
 - `let mut move y = x;`, `let move mut y = x;`, `var mut move y = x;`, and
 `var move mut y = x;` are accepted combined modifier forms,
 - copyable existing sources still copy, so both bindings remain independent,
 - `let move Some(value) = maybe;`,
 `let move Some(value) = maybe else { ... };`, `if let move Some(value) =
 maybe { ... }`, `else if let move Some(value) = maybe { ... }`, and
 `while let move Some(value) = next() { ... }` consume the pattern scrutinee
 under the same move and borrow checks.

## Completeness

The borrow checker is complete for the currently documented and
regression-tested Silk language subset, including the wrapper and control-flow
forms described above. New language features may still require new borrow
rules, but those are not treated as pre-declared borrow-checker roadmap items.
Any such extension must be specified in [grammar](?p=language/grammar) and in this
document before implementation lands, and must be reflected in diagnostics
([diagnostics](?p=compiler/diagnostics)) and tests.
