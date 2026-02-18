# Mutability

Mutability in Silk is “safe by default”: values are immutable unless explicitly marked mutable under clear rules using the `mut` keyword.

- All local bindings are immutable (read‑only) by default.
- `const` bindings are always immutable (there is no `const mut`).
- All function parameters are immutable (read‑only) by default.
- A **value** parameter may be declared `mut` to allow reassignment of the
  parameter binding inside the callee (this does not affect the caller).
- A borrowed reference parameter (`&T`) follows a two‑part `mut` borrow
  contract:
  - the parameter is declared `mut`, and
  - the call site uses `mut <expr>` to explicitly create a mutable borrow.
- A slice parameter (`T[]`) is a non-owning view; when the callee intends to
  mutate through a slice view, it also follows a two-part contract:
  - the parameter is declared `mut`, and
  - the call site uses `mut <expr>` to explicitly pass a mutable slice view.

This two‑part system makes mutation explicit and intentional.

## Local Mutability (`let mut`)

Local bindings introduced with `const` and `let` are immutable by default. To
allow a local binding to be updated, it must be declared with `let mut` (or
`var`, which is an alias for `let mut`):

```silk
fn main () -> int {
  let mut x: int = 0;
  x = 1;
  x += 2;
  return x;
}
```

Key rules:

- Only `let mut` bindings may appear on the left-hand side of an assignment.
- The left-hand side must refer to an existing binding (an lvalue).
- The type checker enforces that the assigned value’s type matches the binding’s type.

## The Principle: Safe by Default

Example from the spec:

```silk
fn read_runner(r: &Runner) {
  // This is OK:
  io::print("Points: {}", r.point);

  // This would be a compile-time error:
  // r.point = 5;
}
```

Key points:

- Borrowed references (`&T`) are read‑only unless explicitly declared `mut`.
- Attempts to mutate through a non‑mutable reference are compile‑time errors.

## Granting Permission to Mutate

To make mutation possible **through a borrowed reference**, `mut` is used both:

- **In the function definition**, to declare that the function intends to mutate:

  ```silk
  fn reset_runner(mut r: &Runner) {
    r.point = 0;
  }
  ```

- **At the call site**, to explicitly pass a mutable argument, acknowledging that the callee is allowed to modify it (syntax defined in the language reference).

The compiler uses this to:

- encode a clear contract that the function may modify its argument,
- ensure callers are consciously opting into mutation.

## Compiler Requirements

The compiler must:

- Enforce immutability by default for parameters and references.
- Require `mut` at both the declaration and call site for mutable borrows.
- Surface clear diagnostics when mutation is attempted without proper `mut` markings.
- Integrate mutability rules with regions, buffers, and concurrency:
  - disallow patterns that would lead to data races,
  - ensure that aliasing and lifetime rules are respected when mutation is allowed.

## Current Implementation Restrictions

The current compiler subset implements:

- Local `let mut` bindings, including assignment and numeric compound assignment.
- `mut` value parameters (`fn inc(mut x: int) { x = x + 1; }`) as a callee-local
  mutable binding (no call-site `mut` marker is required).
- Borrowed reference parameters of the form `&Struct` for the current supported `struct` subset.
- The two-part `mut` borrow contract for mutable reference parameters:
  - parameter declared `mut` (e.g. `fn bump(mut p: &Pair)`), and
  - call site uses `mut <expr>` (e.g. `bump(mut pair)`).
- Field updates through both:
  - local `let mut` struct bindings (`pair.a = 1`, `pair.b += 2`), and
  - `mut` borrowed reference parameters (`p.a = 1`, `p.b += 2`).
- Local borrowed references (`&Struct`) as first-class values:
  - via the borrow operator `&expr` on borrowable lvalues (e.g. `&pair`, `&obj.field`), and
  - via implicit borrow coercions in contexts that expect `&T`
    (for example `let r: &Pair = pair;`).
  These borrows are checked with conservative **lexical lifetime** rules (they
  may not escape the scope of the borrowed stack storage).
- Local bindings of `&Struct` values that originate from heap allocation (`new`)
  or from calls that return `&Struct`:
  - these `&Struct` values are refcounted in the current subset,
  - copying a `&Struct` binding (e.g. `let g: &File = f;`) creates an alias to
    the same underlying heap allocation and increments the refcount.

## Borrow Safety Rules (Current Subset)

Borrowed references (`&T`) in the current compiler subset are safe-by-default
and, for now, use conservative **lexical lifetime** checks:

- Borrowed references can be created and stored as local values (see above).
- The callee can mutate a borrowed reference only when:
  - the parameter is declared `mut`, and
  - the caller uses `mut <expr>` at the call site.
- Mutable borrows must be explicit and must originate from a borrowable lvalue:
  - borrowing a local binding requires a writable base (`let mut`) or an
    already-mutable view, and
  - field borrows follow the same rule (the base must be writable).

Slice views (`T[]`) are also call-scoped and safe-by-default:

- A slice value is a non-owning view (pointer + length) and may alias other
  slice views into the same underlying storage.
- Slice range borrows are created via:
  - `&a[start..end]`
  - `&a[..end]`
  - `&a[start..]`
  - `&a[r]` where `r: range` (including `..=` inclusive ranges)
- A mutable slice view is created via `mut &a[...]` and is restricted:
  - the base must be a borrowable lvalue (a name or a field-access chain rooted
    at a name), and
  - the base storage must be writable (`let mut` for fixed arrays / structs, or
    an already-mutable view such as a `mut` borrowed reference parameter), or
    already a mutable slice view.
- A function parameter of slice type may be declared `mut` to allow mutation
  through the slice view, and requires the caller to pass a mutable slice view
  using `mut <expr>`.
- When a slice value is stored in a struct field (`xs: T[]`), the stored view’s
  mutability is tracked:
  - storing `&a[...]` stores a read-only view, and
  - storing `mut &a[...]` stores a mutable view.
  A call-site `mut <expr>` marker does not upgrade a read-only stored view into
  a mutable one; passing a field as `mut` requires that the field already holds
  a mutable view.

### Aliasing Restrictions (Per Call)

Within a single call expression, the compiler enforces conservative aliasing
rules to avoid creating multiple mutable views of the same storage:

- A given binding may be mutably borrowed at most once in a single call.
- A binding may not be both mutably and immutably borrowed in the same call.
- Multiple immutable borrows of the same binding are permitted.

For slice parameters (`T[]`), these same per-call aliasing restrictions apply.
Additionally, when both borrows are slice range borrows of the same base with
integer-literal bounds, the checker permits multiple mutable borrows in the same
call when it can prove the two ranges are disjoint (including when the slices
are first bound to locals and then passed by name).

When borrowing a range from an existing slice binding (for example `s: T[]`),
the checker interprets `&s[start..end]` as a subrange of the underlying base
(offset by `s`’s known bounds) for the purposes of overlap checks. This
disjointness reasoning is currently limited to integer-literal bounds and to
slice bindings whose own bounds are known.

For `&Struct` reference-typed local bindings and slice-typed (`T[]`) local
bindings, the compiler also tracks obvious aliasing introduced by copying and
ref “shape casts”:

- Copying a `&Struct` binding produces an alias (it refers to the same storage).
- Copying a slice binding (`T[]`) produces an alias (it refers to the same underlying storage).
- Casting `&S` to `&T` via `as` under the shape-cast rules produces an alias
  (it is a retyped view of the same storage).
- The per-call aliasing restrictions apply across aliases: within a single call
  expression, you may not take multiple mutable borrows (or both mutable and
  immutable borrows) of the same underlying reference, even if they are held
  under different local names.

Example (rejected):

```silk
fn swap(mut a: &Pair, mut b: &Pair) {
  // ...
}

fn main () -> int {
  let mut p: Pair = Pair{ a: 1, b: 2 };
  swap(mut p, mut p); // error: two mutable borrows of `p` in one call
  return 0;
}
```

Example (allowed, immutable):

```silk
fn sum2(a: &Pair, b: &Pair) -> int {
  return a.a + a.b + b.a + b.b;
}

fn main () -> int {
  let p: Pair = Pair{ a: 1, b: 2 };
  return sum2(p, p); // OK: multiple immutable borrows
}
```

## ABI Notes (Exported/C Boundaries)

At C ABI boundaries (`export fn`), reference types are supported only for
opaque handle types (`&Opaque` / `mut &Opaque`). Non-opaque `&Struct` borrows
are not ABI-stable; see the ABI and struct layout docs for the current rules.
