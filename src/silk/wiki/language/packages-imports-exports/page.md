---
layout: "docs"
title: "Packages, imports, and exports"
description: "Silk has explicit module/package structure:"
docsCollection: "silkWiki"
section: "language"
order: 16
sourcePath: "language/packages-imports-exports.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Packages, imports, and exports

Silk has explicit module/package structure:

- a source file may declare `package ...;` or header-form `module ...;` (mutually exclusive),
- imports come next as a contiguous block,
- then declarations (`fn`, `let`, `struct`, `enum`, `impl`, ...).

Silk supports both:

- package imports (`import std::io;`, `import ui;`),
- file imports (`import { Name } from "./module.slk";`).

Full reference: [packages imports exports](/silk/wiki/language/packages-imports-exports/).

## Notes

- Full rules and many examples: [packages imports exports](/silk/wiki/language/packages-imports-exports/)

## Syntax
```silk
package my_app;

import std::io;
import { add } from "./math.slk";
import helpers from "./helpers.slk"; // default import / namespace import

export fn main () -> int { return 0; }
```

## Examples

### Example: named file import
```silk
// math.slk
package app;

export fn add (x: int, y: int) -> int {
  return x + y;
}
```

```silk
// main.slk
package app;

import { add } from "./math.slk";

fn main () -> int {
  return add(40, 2);
}
```

### Example: default export and default import
```silk
// module.slk
package module;

export default fn () -> int {
  return 1 + 2;
}
```

```silk
// main.slk
import foo from "./module.slk";

fn main () -> int {
  return foo();
}
```

## See also

- Full reference: [packages imports exports](/silk/wiki/language/packages-imports-exports/)
- Std module structure rules: [package structure](/silk/wiki/std/package-structure/)
