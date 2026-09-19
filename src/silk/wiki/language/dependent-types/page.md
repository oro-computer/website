---
layout: "docs"
description: "This page covers Silk’s intended support for types that mention compile-time values (especially integers), such as dependent-length collections."
docsCollection: "silkWiki"
section: "language"
order: 47
sourcePath: "language/dependent-types.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Dependent types (const parameters) (design)

This page covers Silk’s intended support for types that mention compile-time
values (especially integers), such as dependent-length collections.

Full reference: [dependent types](/silk/wiki/language/dependent-types/).

## Example (Design)

```silk
// Design-only sketch: a vector type with a compile-time length `N`.
struct VectorN(T, N: int) { /* ... */ }
```

## See also

- Full reference: [dependent types](/silk/wiki/language/dependent-types/)
- Generics: [generics](/silk/wiki/language/generics/)
