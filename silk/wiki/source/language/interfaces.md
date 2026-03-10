# Interfaces

Interfaces declare method signatures that types (or modules) can conform to via
`impl ... as ...` (or `module ... as ...`). This is the basis for protocol-like
surfaces such as iterators and Drop.

Canonical spec: [Interfaces](../docs/?p=language/interfaces).

## Status

- Interface declarations plus `impl ... as ...` conformance checking are part of
  the current compiler subset.
- Interface values / trait objects / vtables are still not implemented.

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

### Example: conformance + direct method call
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

- [Canonical doc](../docs/?p=language/interfaces)
- [Std protocols](?p=std/interfaces)
