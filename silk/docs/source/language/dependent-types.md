# Dependent Types (Const Parameters and Type-Level Computation)

This page covers Silk’s **dependent-type-like** surface: places where a type
mentions a compile-time value, most commonly an integer const parameter.

Use this when the thing you want to express is about **compile-time shape**:

- “this wrapper carries exactly `N` elements,”
- “this helper accepts an array of length `N`,”
- “this API preserves a compile-time capacity or digest size.”

Use [`Formal Silk`](?p=language/formal-verification) instead when the thing you
want to express is a **value predicate**:

- `len >= 0`
- `cap >= len`
- `offset + size <= total`

## Implementation status

Status: **Implemented subset + design**.

The current compiler subset already supports:

- const parameters on parameterized declarations such as:
  - `struct`
  - `interface`
  - `enum`
  - `impl`
- applied types with const arguments, for example:
  - `Wrap(u8, 4)`
  - `Matrix(f32, 16)`
- generic functions and generic methods using the compile-time/runtime split
  parameter list:
  - `fn get_first(T, N: usize; xs: &T[N]) -> T`
- explicit generic call syntax with `;`, for example:
  - `id(int; 123)`
  - `take_buf(4; buf4)`
- call-site inference of both type and const arguments when the runtime
  arguments carry enough type information.

What is still design work:

- general type-level arithmetic such as `M + N` in result types,
- solver-backed constraints over const parameters,
- arbitrary value predicates attached to types,
- richer proof-oriented reasoning about compile-time values.

## Current subset: real, useful patterns

### Fixed-size wrappers

This is the basic dependent-type-like pattern in Silk today:

```silk
struct Wrap(T, N: usize) {
  buf: T[N],
}

fn main () -> int {
  let w: Wrap(u8, 4) = { buf: [1, 2, 3, 4] };
  return 0;
}
```

This is useful for:

- fixed-size digests,
- packet headers with compile-time field widths,
- small stack buffers,
- array-backed ring/storage wrappers.

### Generic functions with explicit compile-time arguments

Generic functions separate compile-time arguments from runtime arguments with a
top-level `;`:

```silk
fn get_first(T, N: usize; xs: &T[N]) -> T {
  return xs[0];
}

fn main () -> int {
  let xs: int[4] = [10, 20, 30, 40];
  return get_first(int, 4; xs) - 10;
}
```

This is the right pattern when you want the call site to be completely explicit
about both the element type and the compile-time shape.

### Generic calls with inference

When the runtime argument already carries enough type information, Silk can
infer both type and const arguments:

```silk
struct Wrap(T, N: usize) {
  buf: T[N],
}

fn take_wrap (T, N: usize; w: Wrap(T, N)) -> int {
  return 0;
}

fn main () -> int {
  let w: Wrap(u8, 4) = { buf: [1, 2, 3, 4] };
  return take_wrap(w);
}
```

The compiler infers `T = u8` and `N = 4` from the type of `w`.

### Inference from array lengths

Const inference also works when a runtime argument type carries a concrete
array length:

```silk
fn take_buf (N: usize; buf: u8[N]) -> int {
  return 0;
}

fn main () -> int {
  let buf4: u8[4] = [1, 2, 3, 4];
  if take_buf(4; buf4) != 0 { return 1; }
  if take_buf(buf4) != 0 { return 2; }
  return 0;
}
```

This is one of the main practical values of const parameters today: APIs can
preserve compile-time array shape without forcing every caller to repeat it.

## Function parameter lists (CT/RT split)

Generic functions use a single parameter list split by a top-level `;` inside
the parentheses:

```silk
fn id(T; x: T) -> T { return x; }
fn get_first(T, N: usize; v: &T[N]) -> T { return v[0]; }
fn h(x: int) -> int { return x; } // RT-only
```

Rules in the current subset:

- the parameters before `;` are compile-time parameters,
- the parameters after `;` are ordinary runtime parameters,
- compile-time arguments may be supplied explicitly at the call site,
- or inferred from runtime arguments when possible.

## Relationship to arrays and collections

Const parameters are the natural surface for:

- fixed-size arrays (`T[N]`),
- compile-time-sized wrappers (`Wrap(T, N)`),
- APIs that preserve array length or capacity through monomorphized calls.

This is where Silk gets real value today:

- compile-time-sized buffers,
- size-preserving generic helpers,
- explicit monomorphized APIs without runtime type metadata.

## What dependent types do **not** replace

Const parameters do **not** replace Formal Silk.

Examples:

- “this array has compile-time length `4`” → const parameter / `T[N]`
- “this runtime `len` is non-negative” → `#require len >= 0`
- “`cap` always dominates `len`” → `#require` on a `struct`
- “this loop monotonically consumes bytes” → `#monovariant`

Use compile-time types for **shape** and Formal Silk for **proof obligations**.

## Diagnostics you will see

The most relevant diagnostics in this area are:

- `E2016` — unsupported generic form outside the current monomorphized subset,
- `E2076` — generic type arguments must be fully specified at the use site,
- `E2091` — generic function call type arguments could not be inferred.

Use explicit compile-time arguments (`f(T, N; ...)`) when inference is not
obvious enough.

## See also

- [`Generics (Monomorphized)`](?p=language/generics)
- [`Types`](?p=language/types)
- [`Formal Silk`](?p=language/formal-verification)
- [`Refinement Types (Removed)`](?p=language/refinement-types)
