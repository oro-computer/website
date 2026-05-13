# Dependent types (const parameters) (design)

This page covers Silk’s intended support for types that mention compile-time
values (especially integers), such as dependent-length collections.

Reference: [dependent types](../docs/?p=language/dependent-types).

## The Basic Idea

A dependent-type-like API carries values such as lengths, capacities, or
protocol widths in the type. This lets the compiler preserve more information
than it could with a plain runtime integer.

```silk
struct VectorN(T, N: int) {
  data: T[N],
}
```

Here `T` is a type parameter and `N: int` is a const parameter. A value of
`VectorN(u8, 32)` is not the same type as `VectorN(u8, 64)`.

## Why It Matters

Const parameters are useful when an API needs shape guarantees:

- buffers with compile-time capacity
- matrices with fixed dimensions
- packet types with fixed header sizes
- functions that preserve or transform lengths

For example, a concatenation API can describe its result shape in the return
type:

```silk
fn concat(T, M: int, N: int; a: VectorN(T, M), b: VectorN(T, N)) -> VectorN(T, M + N) {
  // result length is part of the type
}
```

The semicolon separates compile-time parameters (`T`, `M`, `N`) from runtime
parameters (`a`, `b`).

## Relationship To Generics

Generics answer “what type is this?” Const parameters answer “which compile-time
value is part of this type?” Silk keeps both in the same parameter list so APIs
can express both:

```silk
struct Window(T, Width: int, Height: int) {
  pixels: T[Width * Height],
}
```

## Design Boundaries

The design requires the compiler to define:

- which expressions are const-evaluable in type positions
- how overflow behaves in type-level arithmetic
- how type inference handles const arguments
- how monomorphized code is named and emitted

When reading or writing examples, treat const-parameter APIs as a design surface
unless the linked reference says a specific form is supported.

## See also

- Reference: [dependent types](../docs/?p=language/dependent-types)
- Generics: [generics](?p=language/generics)
- Arrays: [types](?p=language/types)
