# Interfaces

Interfaces declare method signatures that types (or modules) can conform to via
`impl ... as ...` (or `module ... as ...`). This is the basis for protocol-like
surfaces such as iterators and Drop.

Canonical spec: `docs/language/interfaces.md`.

## Status

- Syntax + conformance checking: `docs/language/interfaces.md`
- Dynamic dispatch (trait objects/vtables): not implemented yet
- End-to-end support snapshot: `STATUS.md`

## Syntax

```silk
interface Len {
  fn len() -> i64;
}

struct Counter {
  n: i64,
}

impl Counter as Len {
  fn len (self: &Counter) -> i64 { return self.n; }
}
```

## Examples

### Works today: conformance + direct method call

```silk
interface Len {
  fn len() -> i64;
}

struct Counter {
  n: i64,
}

impl Counter as Len {
  fn len (self: &Counter) -> i64 { return self.n; }
}

fn main () -> int {
  let c: Counter = Counter{ n: 3 };
  return c.len() as int;
}
```

## See also

- Canonical spec: `docs/language/interfaces.md`
- Std protocols: `docs/std/interfaces.md`
