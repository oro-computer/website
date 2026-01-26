# Dependent Types (Const Parameters and Type-Level Computation)

This document specifies Silk’s intended support for “dependent-type-like”
patterns where types mention compile-time values (most notably integers).

Status: **design + partial parsing**. The front-end can parse and preserve:

- declaration parameter lists on `struct`, `impl`, and `fn`,
- type application in type positions (for example `VectorN(int, 1024)`),

but the compiler does not yet implement constraint checking, inference, or
monomorphization/code generation for parameterized declarations. In the current
compiler subset, generic parameter lists and applied types are rejected during
type checking (`docs/compiler/diagnostics.md`, `E2016`). See
`docs/language/generics.md`.

## Const Parameters (Planned Semantics)

Const parameters are compile-time values that appear in parameter lists with a
type annotation:

```silk
struct VectorN(T, N: int) { /* ... */ }
```

Where:

- `T` is a type parameter, and
- `N: int` is a const parameter whose value must be known at compile time.

The initial supported const-argument form in type application is integer
literals (for example `VectorN(int, 1024)`).

## Type-Level Computation (Planned)

The language intends to allow certain expressions over const parameters in type
positions (design-only):

```silk
fn concat(T, M: int, N: int; a: VectorN(T, M), b: VectorN(T, N)) -> VectorN(T, M + N) {
  // ...
}
```

This requires:

- a notion of const expressions at the type level,
- evaluation rules (and overflow behavior) for those expressions,
- and a compilation strategy (typically monomorphization) that produces concrete
  layouts and code for each instantiated type.

## Function Parameter Lists (CT/RT Split)

Generic functions use a single parameter list split by a top-level `;` inside
the parentheses:

```silk
fn id(T; x: T) -> T { return x; }
fn g(T;) -> T { /* CT-only, rare */ }
fn h(x: int) -> int { return x; } // RT-only
```

This split is parsed and preserved by the front-end, but generic functions are
rejected by the current checker until monomorphization is implemented
(`docs/compiler/diagnostics.md`, `E2016`).

## Relationship to Arrays and Collections

Const parameters are intended to power:

- fixed-size arrays (`T[N]`),
- dependent-length collections (for example `VectorN(T, N)`),
- and compile-time-checked indexing/slicing APIs.

These features require additional language and runtime support beyond the
current compiler subset.
