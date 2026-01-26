# Literals Overview

This document provides a high-level overview of literals in Silk, with details split into dedicated documents for each category.

For first-time readers, a good path is:

1. `docs/language/types.md` (primitive types like `int`, `f64`, `bool`, `string`),
2. this overview (what literal categories exist),
3. the specific literal docs below (syntax, semantics, and what works today).

Returning readers typically want the “Implementation Status” section near the top
of each literal concept doc, plus the “Relevant Tests” links for runnable
examples.

## Literal Categories

Silk includes the following literal categories:

- Numeric literals
- Duration literals
- Boolean literals
- Character literals
- String literals
- Regular expression literals
- Aggregate literals (arrays, structs)

Each literal form has well-defined syntax and type inference rules that the compiler must implement.

See:

- `literals-numeric.md`
- `literals-duration.md`
- `literals-boolean.md`
- `literals-character.md`
- `literals-string.md`
- `literals-regexp.md`
- `literals-aggregate.md`
