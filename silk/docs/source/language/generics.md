# Generics (Monomorphized)

This document specifies Silk’s parameterized type and declaration syntax.

Status: **in progress**. Silk’s generics are **compile-time** features:
parameterized declarations are **monomorphized** into concrete, fully specified
types and functions at build time (there are no runtime type parameters).

Note: `Option(T)` is a special-case surface form that is treated as sugar for
`T?` in the current subset (see `docs/language/optional.md`). This is still
accepted in the current subset even as general-purpose type-parameter generics are
implemented.

## Overview

Silk supports parameterized declarations by allowing a parameter list on
`struct`, `interface`, `enum`, `impl`, and `fn` declarations.

In the current compiler subset:

- **Supported**: type parameters (`T`) and const parameters (`N: usize`) on
  `struct`/`interface`/`enum`/`impl`, type application in type positions
  (`Name(args...)`), and generic functions using a compile-time parameter
  section separated by `;` in the signature (`fn id(T; x: T) -> T`) (including
  generic methods in `impl` blocks).

## Declaration syntax

### Parameter lists

The parameter list uses parentheses:

```silk
struct Vector(T) {
  // ...
}
```

Rules:

- `T` is a type parameter.
- Type parameters may provide a default type argument using `=`:
  - `interface Serialize(S = string) { ... }`
  - defaults must be **trailing** (once a parameter has a default, all
    subsequent parameters must also have defaults).
- Const parameters are written with an explicit type annotation:
  - `N: usize`
  - const parameters are compile-time integer values and may be used in type
    positions such as array lengths (`T[N]`) and type applications.
- The parameter list may be empty (though it is uncommon): `struct Foo() { ... }`.

Supported declaration forms:

- `struct Name(T, ...) { ... }`
- `interface Name(T, ...) { ... }`
- `enum Name(T, ...) { ... }`
- `impl Name(T, ...) { ... }`
- `impl Name(T, ...) as InterfaceName(T, ...) { ... }`

### Applying parameters in types

Parameterized types are referenced using the same call-like syntax in type
positions:

```silk
Vector(int)
Mutex(Account)
Result(int, string)
```

## Generic enums (tagged unions)

Enums may be parameterized and are monomorphized like generic structs.

Because applied types are not used directly as expression qualifiers in the
current surface syntax, callers typically introduce a local alias for an
instantiation and then use that alias to construct and match variants:

```silk
enum Result(T, E) {
  Ok(T),
  Err(E),
}

type R = Result(int, string);

fn main () -> int {
  let x: R = R::Ok(123);
  return match x {
    R::Ok(v) => v,
    R::Err(_) => 0,
  };
}
```

Default type arguments:

- When a parameterized declaration provides default type arguments, a use site
  may omit **trailing** arguments that have defaults.
- If all parameters have defaults, the type may be referenced as `Name` or
  `Name()` (both are equivalent to applying the defaults).

Type arguments may be:

- types (e.g. `int`, `&Foo`, `Option(string)`).
- integer literals for const parameters (e.g. `Vector(u8, 1024)`).

Const arguments are compile-time integer literals and participate in
monomorphization identity.

## Interfaces and applied interface types

Interfaces may be generic:

```silk
interface Channel(T) {
  fn send(value: T) -> bool;
  fn recv() -> T?;
}
```

An `impl ... as ...` conformance may apply type arguments to the interface:

```silk
struct QueueU8 {
  // ...
}

impl QueueU8 as Channel(u8) {
  // ...
}
```

Rule: when a generic interface is referenced in a concrete `impl X as I(...)`,
all interface type arguments must be fully known at that conformance site. The
only exception is when the conformance itself is generic (type parameters are
in scope), for example:

```silk
struct Data(T) { /* ... */ }
interface DataInterface(T) { /* ... */ }

impl Data(T) as DataInterface(T) {
  // ...
}
```

## Impl blocks for generic structs

If a struct is declared with type parameters, its impl blocks must also declare
those parameters:

```silk
struct Data(T) { /* ... */ }

// OK:
impl Data(T) { /* ... */ }

// Error:
// impl Data { /* ... */ }
```

This rule keeps method receiver typing unambiguous and makes monomorphization
explicit.

## Functions (initial parsed surface form)

Generic functions require a way to declare type/const parameters distinct from
value parameters. The initial parsed surface form is:

```silk
fn get_first(T, N: usize; v: &T[N]) -> T {
  // ...
}
```

Where the `;` separates generic parameters from value parameters inside the
function’s parameter list.

### Alternate (Go-like) function declaration syntax

Silk also supports a Go-like generic header form:

```silk
fn (T, N: usize) get_first (v: &T[N]) -> T {
  // ...
}
```

This is sugar for the `;` form above; the compiler records the same generic
parameter list (`T, N: usize`) either way.

Rules:

- At most one generic parameter list may be provided:
  - either `fn name(T; ...)`,
  - or `fn (T) name (...)`.

### Call syntax for generic functions

Calls mirror the signature split:

```silk
let x: int = get_first(int, 4; &xs);
```

Rules:

- the `;` separates compile-time arguments from runtime value arguments,
- compile-time arguments are a comma-separated list of:
  - type arguments (`int`, `&Foo`, `Option(string)`),
  - and integer literals for const arguments,
- runtime arguments are ordinary expressions.
- the compile-time argument list may be empty when defaults supply all generic
  parameters, for example `id_default(; 1)` uses the default type argument for
  `T` in `fn id_default(T = int; x: T) -> T`.

### Call-site type inference (omitting `;`)

When a call does not include the generic separator (`;`), the compiler may
infer type and const arguments from runtime arguments:

```silk
fn (X, Y) add (x: X, y: Y) -> X {
  return x + y as X;
}

let a = add(1.123, 2); // infers X = f64, Y = int
```

Rules:

- Both **type** parameters (`T`) and **const** parameters (`N: usize`) may be
  inferred.
- Inference is driven by the runtime argument expressions and any types that
  are known at the call site:
  - literals (`123`, `1.0`, `"hi"`, `'a'`, `true`),
  - struct literals (`Point { ... }`),
  - explicit casts (`expr as Type`),
  - and name expressions (`x`) when the binding’s type is known (from an
    annotation like `let x: T = ...` or from a simple initializer like a
    literal/struct literal).
- Const parameters are inferred only from type structure:
  - array lengths (`T[N]`),
  - and const arguments in applied types (`Buffer(T, N)`),
  when the corresponding runtime argument type provides a concrete value.
- When inference cannot determine a type argument, compilation fails with an
  actionable diagnostic. Disambiguate by either:
  - inserting `as` casts on runtime arguments, or
  - using the explicit `;` form (`add(f64, int; 1.123, 2)`).
  When inference cannot determine a const argument, disambiguate by using the
  explicit `;` form (`take_buf(4; buf)`).

## Implementation notes

- Monomorphization produces a concrete instance for each referenced
  instantiation `Name(args...)`.
- Type names share one namespace within a `package`: `struct`, `interface`,
  `enum`, `error`, and `type` declarations may not reuse the same name.
- Name conflicts across generic arities are rejected (for example, `struct Foo`
  and `struct Foo(T)` cannot both exist in the same package namespace).
- Const parameters are currently restricted to integer primitive types; const
  values are usable in type positions (for example `T[N]`) but are not yet
  exposed as runtime values.
