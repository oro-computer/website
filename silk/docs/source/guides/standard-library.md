# Standard library

Silk’s standard library lives under the reserved `std::` namespace. This is where “practical systems programming” shows up:
I/O, filesystem, networking, parsing, collections, time, and the shared conventions that make those modules compose.

This page is not a full reference (the sidebar is). It’s a guide to the **shape** of `std::`, how to use it, and what
patterns to expect.

## Importing `std::` modules

You can import an entire package, or import a single symbol:

```silk
import std::io;                 // package import (use as std::io::println, ...)
import std::io::println;        // symbol import (use as println(...))
import std::fs;                 // filesystem
import std::result::Result;     // common return shape
```

Use symbol imports when you want the dependency to be explicit at the call site (especially in small programs). Use package
imports when you want a cohesive namespace (common for larger modules).

## The three common “return shapes”

`std::` APIs intentionally reuse a small set of patterns so code stays readable.

### 1) Optionals: `T?`

`T?` means “a `T` or no value” (`Some(...)` / `None`).

Use this when “absence” is expected and you don’t need rich error information.

```silk
fn parse_port (s: string) -> int? {
  // Example sketch: a real parser would validate digits.
  if s == "" { return None; }
  return Some(8080);
}
```

### 2) Results: `std::result::Result(T, E)`

`Result(T, E)` is the standard “success or error” type used across `std::`.

```silk
import std::result;

type IntOrMessage = std::result::Result(int, string);

fn div (a: int, b: int) -> IntOrMessage {
  if b == 0 { return Err("division by zero"); }
  return Ok(a / b);
}
```

In real code you typically `match` on a result so success and failure paths stay explicit.

### 3) Typed errors: `T | E`

Silk supports typed errors directly in the language: a value is either a success type `T` or an error type `E`.

This is a good fit when:

- the error has structure (fields), and
- callers are expected to handle distinct failure reasons.

You’ll see both `T | E` and `Result(T, E)` in the ecosystem; `std::` uses `Result` heavily because it composes cleanly and
is easy to pattern-match.

## A quick tour of key modules

### `std::io` — printing and stream I/O

`std::io` covers console I/O and basic stream patterns.

```silk
import std::io::println;

fn main () -> int {
  println("hello {s} answer={d}", "world", 42);
  return 0;
}
```

When you need lower-level I/O, `std::io` also exposes byte-oriented read/write primitives and stable error kinds.

Reference: `std::io` (see the sidebar under “Standard library”).

### `std::fs` — filesystem operations

`std::fs` provides file and directory helpers and a low-level `File` handle.

Whole-file helpers are intentionally common:

```silk
import std::fs;
import std::io::println;

fn main () -> int {
  match (std::fs::read_file_string("message.txt")) {
    Ok(s) => {
      println("{s}", s.as_string());
      return 0;
    },
    Err(e) => {
      // A real program would format/inspect `e.kind()` and report it.
      println("read failed");
      return 1;
    },
  }
}
```

Reference: `std::fs`, `std::path`.

### `std::strings` — owned strings and utilities

Silk has a built-in `string` type (an immutable view over UTF‑8 bytes). The standard library adds an owning `String` for
when you need to build or retain dynamic strings.

Reference: `std::strings`, `std::unicode`.

### `std::json` and `std::toml` — configuration and structured data

Silk includes parsers for data formats used in real programs:

- `std::toml` for configuration (including `silk.toml` manifests)
- `std::json` for interoperability and structured data exchange

Reference: `std::toml`, `std::json`.

### `std::task`, `std::sync`, `std::temporal`

For concurrent and time-aware programs, `std::` provides:

- `std::task` (tasks, scheduling primitives)
- `std::sync` (mutexes/locks and synchronization)
- `std::temporal` (time types like `Duration`/`Instant`)

Reference: `std::task`, `std::sync`, `std::temporal`.

## How to keep `std::` code readable

Two patterns pay off quickly:

1. **Use small local aliases for verbose types.** For example, alias a `Result` instantiation to a short name.
2. **Prefer `match` at boundaries.** Convert errors into your own types at module boundaries, so the rest of your program
   doesn’t become a chain of “plumbing”.

## Next

- [CLI and toolchain](?p=guides/cli)
- [Testing](?p=guides/testing)

