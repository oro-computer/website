# Doc comments

Silk supports both line and block doc comments. They attach to the following
declaration (like many C/Rust-style doc systems).

Reference: [doc comments](../docs/?p=language/doc-comments).

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

## Attachment

Doc comments attach to the next declaration when only whitespace or ordinary
comments appear between them and the declaration.

```silk
/// Returns the process exit code.
fn main () -> int {
  return 0;
}
```

For functions with Formal Silk contracts, the doc comment still describes the
function even when verification annotations sit between the comment and `fn`:

```silk
/// Increments a non-negative integer.
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

## Tags

Silkdoc supports free-form Markdown-friendly text plus tags:

```silk
/**
 * Copies bytes from `src` to `dst`.
 *
 * @param dst: &Buffer Destination buffer.
 * @param src: &Buffer Source buffer.
 * @returns int Number of bytes copied.
 */
fn copy (dst: &Buffer, src: &Buffer) -> int {
  return 0;
}
```

Use tags when generated docs need structured parameter or return information.
Use prose when the important part is intent, invariants, or examples.

## Good Doc Comments

- say what the declaration is for
- mention ownership or lifetime rules when relevant
- mirror important `#require` constraints in human language
- include a small example for public APIs

## See also

- Reference: [doc comments](../docs/?p=language/doc-comments)
- Formal Silk: [formal verification](?p=language/formal-verification)
- Conventions: [conventions](?p=language/conventions)
