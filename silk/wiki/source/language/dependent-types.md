# Dependent types (const parameters) (design)

This page covers Silk’s intended support for types that mention compile-time
values (especially integers), such as dependent-length collections.

Canonical design doc: `docs/language/dependent-types.md`.

## Example (Design)

```silk
// Design-only sketch: a vector type with a compile-time length `N`.
struct VectorN(T, N: int) { /* ... */ }
```

## See also

- Canonical design doc: `docs/language/dependent-types.md`
- Generics: `docs/wiki/language/generics.md`
