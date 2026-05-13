# Syntax tour

This tour gives you the shape of a Silk source file before you dive into the
full reference. It is intentionally compact; the detailed tour is here:
[syntax tour](../docs/?p=language/syntax-tour).

## Minimal Executable

```silk
fn main () -> int {
  return 0;
}
```

Most Silk statements end in `;`, blocks use braces, and executable builds use a
top-level `main` that returns `int`.

## File Header

Larger files usually start with a package declaration and imports:

```silk
package app;

import io from "std/io";
import { trim } from "std/strings";
```

Declarations follow the import block.

## Functions

```silk
fn add (a: int, b: int) -> int {
  return a + b;
}
```

Function parameters are named and typed. Return types are explicit after `->`.

## Structs And Impl Blocks

```silk
struct User {
  id: int,
  name: string,
}

impl User {
  fn label (self: &User) -> string {
    return self.name;
  }
}
```

Struct literals use field names:

```silk
let user = User{ id: 1, name: "ada" };
```

## Flow Control

```silk
fn classify (n: int) -> string {
  if n == 0 {
    return "zero";
  } else if n > 0 {
    return "positive";
  }
  return "negative";
}
```

Silk also has `match`, `loop`, `while`, `for`, `break`, `continue`, and
`return`.

## Optionals

```silk
fn configured_name () -> string? {
  return None;
}

fn main () -> int {
  let name: string = configured_name() ?? "guest";
  return 0;
}
```

`T?` means an optional `T`. Use `??` to provide a fallback.

## Async And Task

```silk
task fn compute () -> int {
  return 42;
}

async fn main () -> int {
  task {
    let t = compute();
    let value: int = yield t;
    return value;
  }
}
```

`async` works with promises; `task` works with task handles.

## Formal Silk

```silk
#require x >= 0;
#assure result >= x;
fn inc (x: int) -> int {
  return x + 1;
}
```

Formal Silk directives are parsed syntax, not comments.

## See also

- Full tour: [syntax tour](../docs/?p=language/syntax-tour)
- Grammar: [grammar](?p=language/grammar)
- Packages/imports/exports: [packages imports exports](?p=language/packages-imports-exports)
- Types: [types](?p=language/types)
