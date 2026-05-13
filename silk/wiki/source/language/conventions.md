# Conventions

This page summarizes the conventions used throughout the Silk language docs:
notation, naming, examples, and cross-linking.

Reference: [conventions](../docs/?p=language/conventions).

## Example Style

Examples should be complete when possible and use two-space indentation:

```silk
fn main () -> int {
  let x: int = 1;
  if x == 1 {
    return 0;
  }
  return 1;
}
```

When an example needs multiple files, label each file with a comment:

```silk
// app/main.slk
package app;

import io from "std/io";

fn main () -> int {
  io::println("hello");
  return 0;
}
```

## Language Notation

- Use `Type` for a type placeholder.
- Use `T` for a generic type parameter.
- Use `N` for a compile-time integer parameter.
- Use `expr` for an expression.
- Use `stmt` for a statement.
- Use `module/path` for import specifiers and `package::symbol` for qualified
 names.

## Reader-Facing Rules

Good language docs answer these questions quickly:

- what the feature is for
- what syntax is accepted
- what it means at runtime or compile time
- what errors are likely
- where to go for the exact grammar

Avoid pages that only say “see another page.” A wiki page should stand alone as
a useful explanation, then link to the canonical reference for precision.

## Cross-Linking

Link to the nearest precise topic:

- [grammar](?p=language/grammar) for syntax
- [types](?p=language/types) for type behavior
- [operators](?p=language/operators) for precedence
- [diagnostics](../docs/?p=compiler/diagnostics) for error codes
- [formal verification](?p=language/formal-verification) for proof syntax

## See also

- Reference: [conventions](../docs/?p=language/conventions)
- Grammar: [grammar](?p=language/grammar)
