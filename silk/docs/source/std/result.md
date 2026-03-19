# `std::result`

Status: **implemented**.

The language’s error model is explicit and typed (`docs/language/errors.md`).
`std::result` standardizes the common “success or error” return shape so that
APIs across `std::` compose cleanly.

When the standard library is enabled (the default), `Result` is available
without explicit imports via the std prelude module `std::runtime::globals`.
Import `std::result` only when you need other exports from the module.

## `Result(T, E)`

`Result(T, E)` models a recoverable “success or error” outcome.

### Representation

`Result(T, E)` is a tagged union:

```silk
enum Result(T, E) {
  Ok(T),
  Err(E),
}
```

### Core API

```silk
module std::result;

enum Result(T, E) {
  Ok(T),
  Err(E),
}

impl Result(T, E) {
  public fn ok (value: T) -> Result(T, E);
  public fn err (err: E) -> Result(T, E);

  public fn is_ok (self: &Result(T, E)) -> bool;
  public fn is_err (self: &Result(T, E)) -> bool;

  public fn unwrap_or (self: Result(T, E), fallback: T) -> T;
  public fn unwrap_or_else (self: Result(T, E), f: fn(E) -> T) -> T;
  public fn unwrap_err_or (self: Result(T, E), fallback: E) -> E;

  public fn ok_value (self: Result(T, E)) -> T?;
  public fn unwrap (self: Result(T, E)) -> T?;
  public fn err_value (self: Result(T, E)) -> E?;

  public fn map (U; self: Result(T, E), f: fn(T) -> U) -> Result(U, E);
  public fn map_err (F; self: Result(T, E), f: fn(E) -> F) -> Result(T, F);
  public fn and_then (U; self: Result(T, E), f: fn(T) -> Result(U, E)) -> Result(U, E);
  public fn or_else (F; self: Result(T, E), f: fn(E) -> Result(T, F)) -> Result(T, F);
}
```

Notes:

- `Result` does not provide aborting unwrap helpers; use `unwrap()` /
  `ok_value()` / `err_value()` (or a `match`) to recover the payload.
- `unwrap()` is a non-aborting alias of `ok_value()` and returns `T?`.
- `is_ok()` / `is_err()` borrow the `Result` and are safe for all payload types.
- `??` is supported directly on recoverable results:
  - `result ?? fallback` yields the `Ok(...)` payload,
  - and evaluates `fallback` only for `Err(...)`.
- Methods that extract or transform payloads consume the `Result` by value. This
  follows the move/cleanup model and avoids copying `Drop` payloads.
- Callback-based combinators (`map`, `map_err`, `and_then`, `or_else`) accept
  function-typed values. Capturing closures exist in the current subset, but
  captures are restricted (see `docs/language/memory-model.md`).
- For portable backend-subset builds, prefer the block-body form with an
  explicit result type for combinator callbacks:
  `fn (x: T) -> U { return ...; }` or
  `fn (x: T) -> Result(U, E) { return Ok(...); }`.
  Anonymous expression-body callbacks still work for simple cases, but the
  explicit block-body form is the stable documented subset for callback-heavy
  `Result` pipelines across executable and object builds.
- `match` supports a shorthand for `Result` destructuring:
  - when the scrutinee type is `Result(T, E)`, patterns `Ok(v)` / `Err(e)` are
    accepted as shorthand for `R::Ok(v)` / `R::Err(e)` where `R` is the scrutinee
    enum type.
- Callers typically introduce a local alias for the instantiated enum so the
  alias name can be used as a qualifier for constructors and patterns when a
  type context is not available:

```silk
type R = Result(int, string);

fn main () -> int {
  let check: R = R.ok(123);
  match (check) {
    Err(_) => {
      return 1;
    },
  }

  let value: int = R.ok(123) ?? 0;
  if value != 123 { return 2; }
  return 0;
}
```

## Ergonomic Handling

When only one side matters, prefer the dedicated one-branch forms over
`is_ok()` / `is_err()` plus a second extraction step.

Use `if let` / `let ... else`:

```silk
let Ok(value) = parse_port(input) else {
  return 1;
};
```

```silk
if let Err(err) = parse_port(input) {
  std::io::println("parse failed: {}", err.code);
}
```

Statement-form `match` also permits a single handled side for `Result`:

```silk
match (parse_port(input)) {
  Ok(value) => {
    std::io::println("port = {}", value);
  },
}
```

Expression extraction with `??`:

```silk
let port: int = parse_port(input) ?? 80;
```

Callback-based chaining:

```silk
type R = Result(int, int);

let next: R = Ok(10).and_then(fn (v: int) -> R {
  if v > 5 {
    return Ok(v);
  }
  return Err(1);
});
```

Payload-aware recovery still uses `unwrap_or_else`, `match`, or `if let Err(...)`
when the fallback needs the error payload. The error-side shorthand is
`unwrap_err_or`; when the fallback must inspect the `Ok(...)` payload, use an
explicit `match`.

In type-directed contexts, `Ok(...)` / `Err(...)` can be used without a
qualifier. For example:

```silk
error Oops {
  code: int
}

fn foo (oops: bool) -> Result(int, Oops) {
  if (oops) {
    return Err(Oops{ code: 123 });
  }
  return Ok(0);
}
```
