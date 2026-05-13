# Cheat sheet

This page is the wiki-sized quick reference for the syntax people look up most
often. For the complete reference, open the full
[language cheat sheet](../docs/?p=language/cheat-sheet).

## Minimal Executable

```silk
fn main () -> int {
  return 0;
}
```

## Packages And Imports

```silk
package app;

import io from "std/io";
import { trim } from "std/strings";

fn main () -> int {
  io::println(trim(" hello "));
  return 0;
}
```

- `import name from "module"` binds a namespace or default export.
- `import { symbol } from "module"` imports a named symbol.
- `package` gives the file a package namespace.

## Bindings

```silk
const answer: int = 42;

fn main () -> int {
  let x: int = answer;
  let mut y: int = 0;
  var z: int = 1;
  y += 1;
  z += 2;
  return x + y + z;
}
```

- `const` is compile-time.
- `let` is immutable.
- `let mut` and `var` are mutable.

## Types

- `bool`, `char`, `string`, `void`
- integers: `u8`, `i8`, `u16`, `i16`, `u32`, `i32`, `u64`, `i64`, `int`
- floats: `f32`, `f64`
- optionals: `T?`
- references: `&T`
- arrays and slices: `T[N]`, `T[]`
- structs, enums, interfaces, and function types

## Structs And Methods

```silk
struct Point {
  x: int,
  y: int,
}

impl Point {
  fn sum (self: &Point) -> int {
    return self.x + self.y;
  }
}
```

## Errors And Optionals

```silk
fn configured_name () -> string? {
  return Some("silk");
}

fn main () -> int {
  let name: string = configured_name() ?? "guest";
  return 0;
}
```

## Concurrency

```silk
task fn compute () -> int {
  return 21 * 2;
}

async fn main () -> int {
  task {
    let t = compute();
    let value: int = yield t;
    return value;
  }
}
```

## Formal Silk

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

## Common Links

- Full reference: [language cheat sheet](../docs/?p=language/cheat-sheet)
- Syntax tour: [syntax tour](?p=language/syntax-tour)
- Grammar: [grammar](?p=language/grammar)
- Formal Silk: [formal verification](?p=language/formal-verification)
