# `std::result`

Status: **implemented**.

The language’s error model is explicit and typed (`docs/language/errors.md`).
`std::result` standardizes the common “success or error” return shape so that
APIs across `std::` compose cleanly.

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

  public fn unwrap_or (value: Result(T, E), fallback: T) -> T;

  public fn ok_value (value: Result(T, E)) -> T?;
  public fn unwrap (value: Result(T, E)) -> T?;
  public fn err_value (value: Result(T, E)) -> E?;
}
```

Notes:

- `Result` does not provide aborting unwrap helpers; use `unwrap()` /
  `ok_value()` / `err_value()` (or a `match`) to recover the payload.
- `unwrap()` is a non-aborting alias of `ok_value()` and returns `T?`.
- `is_ok()` / `is_err()` borrow the `Result` and are safe for all payload types.
- `unwrap_or()` / `ok_value()` / `unwrap()` / `err_value()` currently take the
  `Result` by value as a current workaround (the language does not yet
  support by-value receivers for instance methods). This copies the active
  payload and is only safe when the active payload does not implement `Drop`.
  For `Result` values that may hold `Drop` payloads (for example `String`,
  `BufferU8`, `TcpStream`), prefer `match (r)` to extract values safely.
- Callback-based combinators (for example `map` / `and_then`) are deferred until
  the IR backend supports non-scalar function-typed parameters and results.
- `match` supports a shorthand for `Result` destructuring:
  - when the scrutinee type is `Result(T, E)`, patterns `Ok(v)` / `Err(e)` are
    accepted as shorthand for `R::Ok(v)` / `R::Err(e)` where `R` is the scrutinee
    enum type.
- Callers typically introduce a local alias for the instantiated enum so the
  alias name can be used as a qualifier for constructors and patterns when a
  type context is not available:

```silk
import std::result;

type R = std::result::Result(int, string);

fn main () -> int {
  let x: R = R.ok(123);
  if x.is_err() { return 1; }
  if R.unwrap_or(x, 0) != 123 { return 2; }
  return 0;
}
```

In type-directed contexts, `Ok(...)` / `Err(...)` can be used without a
qualifier. For example:

```silk
import std::result;

error Oops {
  code: int
}

fn foo (oops: bool) -> std::result::Result(int, Oops) {
  if (oops) {
    return Err(Oops{ code: 123 });
  }
  return Ok(0);
}
```
