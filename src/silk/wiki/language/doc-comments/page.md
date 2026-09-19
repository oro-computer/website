---
layout: "docs"
description: "Silk supports both line and block doc comments. They attach to the following declaration (like many C/Rust-style doc systems)."
docsCollection: "silkWiki"
section: "language"
order: 15
sourcePath: "language/doc-comments.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Doc comments

Silk supports both line and block doc comments. They attach to the following
declaration (like many C/Rust-style doc systems).

Full reference: [doc comments](/silk/wiki/language/doc-comments/).

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

- Full reference: [doc comments](/silk/wiki/language/doc-comments/)
