# Literals

Literals are the simplest way to write values directly in source code:
numbers, booleans, chars, strings, durations, and aggregates like arrays
struct literals.

This wiki page is a learning-oriented companion to the canonical spec:
[Literals Overview](../docs/?p=language/literals-overview).

## Status

- Detailed rules and edge cases live in the per-literal docs linked below.

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

### Example: array literal + indexing
```silk
fn main () -> int {
  let xs: int[3] = [10, 20, 30];
  return xs[1];
}
```

### Example: strings and escapes
```silk
import std::io;

fn main () -> int {
  std::io::println("line1\\nline2");
  return 0;
}
```

## See also

- [Canonical spec](../docs/?p=language/literals-overview)
- Numeric: [Numeric Literals](../docs/?p=language/literals-numeric)
- Strings/chars: [String Literals](../docs/?p=language/literals-string), [Character Literals](../docs/?p=language/literals-character)
- Aggregates: [Aggregate Literals](../docs/?p=language/literals-aggregate)
