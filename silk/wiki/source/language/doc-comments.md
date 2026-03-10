# Doc comments

Silk supports both line and block doc comments. They attach to the following
declaration, similar to other C/Rust-style doc systems.

Canonical doc: [Doc comments](../docs/?p=language/doc-comments).

`@throws` is still documentation-only, but Silk already has typed errors and
`Result(T, E)` conventions. The current limitation is that doc comments are not
yet checked against function signatures.

## Syntax

```silk
/// Line doc comment
fn main () -> int { return 0; }

/**
 * Block doc comment
 *
 * @example silk
 * fn main () -> int { return 0; }
 */
fn other () -> int { return 0; }
```

## See also

- [Canonical doc](../docs/?p=language/doc-comments)
- [Typed errors](?p=language/typed-errors)
