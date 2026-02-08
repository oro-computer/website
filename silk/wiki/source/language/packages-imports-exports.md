# Packages, imports, and exports

Silk has explicit module/package structure:

- a source file may declare `package ...;` or header-form `module ...;` (mutually exclusive),
- imports come next as a contiguous block,
- then declarations (`fn`, `let`, `struct`, `enum`, `impl`, ...).

Silk supports both:

- package imports (`import std::io;`, `import ui;`),
- file imports (`import { Name } from "./module.slk";`).

Canonical spec: `docs/language/packages-imports-exports.md`.

## Status

- Full rules and many examples: `docs/language/packages-imports-exports.md`

## Syntax (Selected)

```silk
package my_app;

import std::io;
import { add } from "./math.slk";
import helpers from "./helpers.slk"; // default import / namespace import

export fn main () -> int { return 0; }
```

## Examples

### Works today: named file import

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

### Works today: default export and default import

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

- Canonical spec: `docs/language/packages-imports-exports.md`
- Std module structure rules: `docs/std/package-structure.md`
