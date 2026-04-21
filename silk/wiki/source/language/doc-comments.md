# Doc comments

Silk supports both line and block doc comments. They attach to the following
declaration (like many C/Rust-style doc systems).

Canonical doc: [doc comments](?p=language/doc-comments).

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

- Canonical doc: [doc comments](?p=language/doc-comments)
