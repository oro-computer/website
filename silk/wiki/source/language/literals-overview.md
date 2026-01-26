# Literals

Literals are the simplest way to write values directly in source code:
numbers, booleans, chars, strings, durations, and aggregates like arrays and
struct literals.

This wiki page is a learning-oriented companion to the canonical spec:
`docs/language/literals-overview.md`.

## Status

- Detailed rules and edge cases: `docs/language/literals-*.md`
- Implemented-subset notes: `STATUS.md`

## Syntax

```silk
let n: int = 42;
let pi: f64 = 3.14159;
let ok: bool = true;
let c: char = '\\n';
let s: string = "hello";

// Duration literals
let d: Duration = 10ms;

// Aggregates
let xs: int[3] = [1, 2, 3];
// let p: Point = Point{ x: 1, y: 2 };
```

## Examples

### Works today: array literal + indexing

```silk
fn main () -> int {
  let xs: int[3] = [10, 20, 30];
  return xs[1];
}
```

### Works today: strings and escapes

```silk
import std::io;

fn main () -> int {
  std::io::println("line1\\nline2");
  return 0;
}
```

## See also

- Canonical spec: `docs/language/literals-overview.md`
- Numeric: `docs/language/literals-numeric.md`
- Strings/chars: `docs/language/literals-string.md`, `docs/language/literals-character.md`
- Aggregates: `docs/language/literals-aggregate.md`
