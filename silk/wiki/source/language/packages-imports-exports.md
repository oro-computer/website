# Packages, imports, and exports

Silk has explicit module/package structure:

- a source file may declare `package ...;` or header-form `module ...;` (mutually exclusive),
- imports come next as a contiguous block,
- then declarations (`fn`, `let`, `struct`, `enum`, `impl`, ...).

Silk user-space code should use module specifier imports:

- namespace imports (`import io from "std/io";`, `import ui from "ui";`),
- named imports (`import { Name } from "./module.slk";`).

Canonical spec: [packages imports exports](?p=language/packages-imports-exports).

## Notes

- Full rules and many examples: [packages imports exports](?p=language/packages-imports-exports)

## Syntax
```silk
package my_app;

import io from "std/io";
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

- Canonical spec: [packages imports exports](?p=language/packages-imports-exports)
- Std module structure rules: [package structure](?p=std/package-structure)
