---
layout: "docs"
description: "This document defines conventions used across docs/language/. It exists to keep the language specification consistent and easy to navigate for both:"
docsCollection: "silk"
section: "language"
order: 69
sourcePath: "language/conventions.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Language Spec Conventions

This document defines conventions used across `docs/language/`. It exists to
keep the language specification consistent and easy to navigate for both:

- first-time readers learning Silk, and
- returning readers looking up precise rules.

See also: [start](/silk/docs/) for recommended reading paths.

## Document Structure (Recommended)

Concept documents should be structured so readers can answer, quickly:

- “What is this feature for?”
- “What syntax does the compiler accept?”
- “What are the rules and edge cases?”
- “What works in the current compiler today?”

Recommended sections:

1. **One-paragraph summary**
2. **Implementation status** (if the concept is Implemented)
3. **Surface syntax**
4. **Semantics** (evaluation order, scoping, control-flow behavior)
5. **Type checking rules** (static requirements and diagnostics)
6. **Examples**
 - minimal examples (smallest correct usage)
 - realistic examples (how the feature is used in real code)
7. **Common pitfalls**
8. **Related documents**
9. **Relevant tests** (links to [`tests/silk/pass_*.slk`](https://github.com/oro-computer/silk/blob/master/tests/silk/pass_*.slk) and [`tests/silk/fail_*.slk`](https://github.com/oro-computer/silk/blob/master/tests/silk/fail_*.slk))

Not every concept needs every section, but the goal is that a reader should
never have to infer critical rules from examples.

## “Implementation status” Format

When a feature is not fully implemented end-to-end, the concept doc should
include an explicit “Implementation status” section near the top.

Use concrete statements, not vague language. Prefer describing support in
these layers:

- Parser: which surface forms are accepted.
- Checker: which typing/validation rules are enforced.
- Lowering/backends: which forms code-generate end-to-end on supported targets.
- C ABI / FFI: whether the feature is permitted at exported boundaries.

When something is rejected in the Supported forms, include the diagnostic code
from [diagnostics](/silk/docs/compiler/diagnostics/) when one exists.

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
- **current implementation**: the set of features that parse, type-check, and
 code-generate end-to-end today.

## Cross-References

When describing a rule, link to the most relevant concept doc rather than
restating it everywhere. Common cross-links include:

- [grammar](/silk/docs/language/grammar/) for the exact accepted syntax,
- [types](/silk/docs/language/types/) for type-system rules and special cases,
- [mutability](/silk/docs/language/mutability/) for `mut` and borrowing rules,
- [diagnostics](/silk/docs/compiler/diagnostics/) for error codes,
- [implementation status](/silk/docs/compiler/implementation-status/) for a high-level implementation snapshot.
