# Refinement types (design)

Refinement types are types annotated with logical predicates (`where`) that
constrain the set of values they may represent.

Canonical design doc: `docs/language/refinement-types.md`.

## Example (Design)

```silk
// Design-only sketch: a string that is proven non-empty.
type NonEmptyString = { s: string where std::length(s) > 0 };
```

## See also

- Canonical design doc: `docs/language/refinement-types.md`
- Formal verification: `docs/wiki/language/formal-verification.md`
