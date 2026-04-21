# Language Spec Conventions

This document defines conventions used across `docs/language/`. It exists to
keep the language specification consistent and easy to navigate for both:

- first-time readers learning Silk, and
- returning readers looking up precise rules.

See also: [language tour](?p=guides/language-tour) for a recommended reading path.

## Document Structure (Recommended)

Concept documents should be structured so readers can answer, quickly:

- “What is this feature for?”
- “What syntax does the compiler accept?”
- “What are the rules and edge cases?”
- “What does the compiler accept?”

Recommended sections:

1. **One-paragraph summary**
2. **Notes** or **Supported forms** (when the page needs to call out active boundaries)
3. **Surface syntax**
4. **Semantics** (evaluation order, scoping, control-flow behavior)
5. **Type checking rules** (static requirements and diagnostics)
6. **Examples**
 - minimal examples (smallest correct usage)
 - realistic examples (how the feature is used in real code)
7. **Common pitfalls**
8. **Related documents**
9. **References** (cross-links to the most relevant docs and, when available, runnable examples)

Not every concept needs every section, but the goal is that a reader should
never have to infer critical rules from examples.

## Notes / Supported Forms

When a feature needs boundary notes, the concept doc should use a neutral
section name such as `Notes` or `Supported forms` near the top.

Use concrete statements, not vague language. Prefer describing support in
these layers:

- Parser: which surface forms are accepted.
- Checker: which typing/validation rules are enforced.
- Lowering/backends: which forms code-generate end-to-end on supported targets.
- C ABI / FFI: whether the feature is permitted at exported boundaries.

When something is rejected by the compiler, include the diagnostic code
from [diagnostics](?p=compiler/diagnostics) when one exists.

## Examples

Examples in language docs should follow these rules:

- Use 2-space indentation and spaces only.
- Prefer complete, runnable snippets when possible:

  ```silk
  fn main () -> int {
    return 0;
  }
  ```

- When an example requires multiple files, label them with comments, e.g.:

  ```silk
  // app/main.slk
  package app;
  ```

- When an example is intentionally invalid (to show a rule), label it and
 mention the expected diagnostic.

## Terminology

These terms are used consistently across the spec:

- **Expression**: a construct that produces a value and has a type.
- **Statement**: a construct evaluated for its effects and sequencing.
- **Block**: `{ stmt* }`, a scope boundary and the unit of structured control
 flow. (Whether blocks are also expressions depends on the concept; docs must
 be explicit.)
- **Supported surface**: the set of features that parse, type-check, and
 code-generate end-to-end in the compiler.

## Cross-References

When describing a rule, link to the most relevant concept doc rather than
restating it everywhere. Common cross-links include:

- [grammar](?p=language/grammar) for the exact accepted syntax,
- [types](?p=language/types) for type-system rules and special cases,
- [mutability](?p=language/mutability) for `mut` and borrowing rules,
- [diagnostics](?p=compiler/diagnostics) for error codes,
- “notes sections near the top of concept docs.
