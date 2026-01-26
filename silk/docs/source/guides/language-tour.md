# Language tour

This is a guided walkthrough of the core ideas you’ll use in real Silk programs: explicit structure, readable types,
predictable control flow, and clear boundaries.

Silk is designed for explicit structure:

- Programs are organized into **packages** and **modules** with clear boundaries.
- Types are **spelled out** when they matter (especially at public boundaries).
- The standard library is under **`std::`** and is designed to be usable for systems programming.

This guide is intentionally example-heavy. For the precise rules, use the reference pages in the sidebar.

## Program structure: packages and imports

At the top of a file you declare your package and then import dependencies:

```silk
package my_app::core;

import std::io::println;
```

This header ordering is intentional: it keeps dependency structure tooling-friendly and prevents “imports halfway down the
file” patterns.

If you omit a `package` declaration, the file belongs to a default package for that build. In real projects, declaring the
package explicitly keeps codebases easier to navigate.

## Values: `let`, `mut`, and explicit types

Silk uses `let` bindings for local values.

```silk
fn main () -> int {
  let port: int = 8080;
  let enabled: bool = true;
  let name: string = "silk";
  return 0;
}
```

Use `mut` when a binding needs to change:

```silk
fn main () -> int {
  let mut sum: int = 0;
  sum = sum + 1;
  return sum;
}
```

The “why” is simple: mutability is a property you can see at the binding site.

## Functions: ordinary code, explicit boundaries

Functions are declared with `fn`, and you write return types explicitly at boundaries:

```silk
fn add (a: int, b: int) -> int {
  return a + b;
}
```

Executables use `fn main () -> int` by convention.

## Exports: a deliberate public surface

Bindings are explicit and can be exported as part of a package’s public surface:

```silk
export let build_name: string = "my_app";

export fn add (a: int, b: int) -> int {
  return a + b;
}
```

Exports matter because they define what other packages can depend on. A large part of Silk’s “readability” comes from being
able to see a package’s public surface without reading every file.

## Structs and methods

Silk uses `struct` for concrete data with well-defined layout. Methods live in `impl` blocks:

```silk
struct Packet {
  seq: u32;
  size: u16;
}

impl Packet {
  fn bytes (self: &Packet) -> u32 {
    return self.size as u32;
  }
}
```

The important idea is not the syntax — it’s that data and behavior stay grouped without turning “types” into magical objects.

## Enums and `match`

Enums model “one of several shapes” and are commonly used with `match`.

```silk
enum Mode {
  Debug,
  Release,
}

fn code_for (m: Mode) -> int {
  return match (m) {
    Mode::Debug => 1,
    Mode::Release => 2,
  };
}
```

`match` is also the natural way to handle results and typed errors (next sections).

## Interfaces (practical contracts)

Interfaces describe required method signatures for a contract. In user code, these are often used to define “protocols”
such as readers, writers, serializers, or log sinks.

```silk
import std::io;

interface LogSink {
  fn write(line: string) -> void;
}

struct StdoutSink {}

impl StdoutSink as LogSink {
  fn write (self: &StdoutSink, line: string) -> void {
    std::io::println("{s}", line);
  }
}
```

The key idea: interfaces are about *meaningful program structure*, not about web-specific types.

## Control flow

Silk uses familiar control flow constructs:

```silk
fn clamp (x: int, lo: int, hi: int) -> int {
  if x < lo { return lo; }
  if x > hi { return hi; }
  return x;
}
```

## Optionals: `T?` and “absence”

Optionals (`T?`) represent an optional value (`Some(...)` or `None`).

```silk
fn parse_flag (s: string) -> bool? {
  if s == "on" { return Some(true); }
  if s == "off" { return Some(false); }
  return None;
}
```

Use optionals when “missing” is a normal outcome and you don’t need structured error details.

## Results: `std::result::Result(T, E)`

When you want a standard “success or error” return shape, use `Result(T, E)`:

```silk
import std::result;

type IntOrMessage = std::result::Result(int, string);

fn div (a: int, b: int) -> IntOrMessage {
  if b == 0 { return Err("division by zero"); }
  return Ok(a / b);
}
```

Callers typically handle results with `match`:

```silk
fn main () -> int {
  match (div(10, 2)) {
    Ok(v) => { return v; },
    Err(_) => { return 1; },
  }
}
```

## Typed errors: structured failures

Silk also supports typed errors directly. You define an error type and return `T | ErrorType`:

```silk
error ParseFailed {
  message: string
}

fn parse_port (s: string) -> int | ParseFailed {
  if s == "" { return ParseFailed{ message: "empty" }; }
  return 8080;
}
```

Then handle it explicitly with `match`:

```silk
fn main () -> int {
  match (parse_port("8080")) {
    port => { return port; },
    _: ParseFailed => { return 2; },
  }
}
```

The value-add is clarity: you can see *what can fail* and *how to handle it* without conventions or exceptions.

## Testing (language-level)

Silk provides language-level tests (`test "name" { ... }`). Tests live next to the code they exercise and are run with
`silk test`.

```silk
import std::test::expect_equal;

fn add (a: int, b: int) -> int { return a + b; }

test "add returns the sum" {
  expect_equal(3, add(1, 2));
}
```

## Next

Next: [Modules & packages](?p=guides/modules-and-packages) · [Standard library](?p=guides/standard-library) ·
[Testing](?p=guides/testing)
