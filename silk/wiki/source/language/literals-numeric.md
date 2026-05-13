# Numeric literals

Silk supports integer and floating-point literals, including base prefixes and
digit separators.

Reference: [numeric literals](../docs/?p=language/literals-numeric).

## Integers

```silk
let decimal: int = 42;
let binary: int = 0b1010;
let octal: int = 0o17;
let hex: int = 0xff;
let readable: int = 1_000_000;
```

Integer literals default to `int` unless a type context selects another integer
type.

## Floats

```silk
let ratio: f64 = 1.5;
let small: f32 = 0.25;
```

Floating-point literals need digits on both sides of the decimal point: write
`0.5`, not `.5`.

## Example

```silk
fn main () -> int {
  let a: int = 42;
  let b: u64 = 0xff as u64;
  let c: f64 = 1.5;
  if a + (b as int) > 0 && c > 0.0 {
    return 0;
  }
  return 1;
}
```

## Sign Is An Operator

`-1` is parsed as unary `-` applied to the literal `1`. That matters for
precedence and for the exact grammar.

```silk
let x: int = -1;
let y: int = 0 - 1;
```

## Duration Tokens

Time literals such as `500ms` and `1.5s` are duration literal tokens, not a
number followed by an identifier.

```silk
let timeout: Duration = 500ms;
```

## Pitfalls

- Separators must be between digits: `1_000` is valid, `_1000` is not.
- `0x`, `0b`, and `0o` prefixes require valid digits for that base.
- Add an explicit type annotation when a literal crosses an API boundary.

## See also

- Reference: [numeric literals](../docs/?p=language/literals-numeric)
- Operators: [operators](?p=language/operators)
- Duration literals: [duration literals](?p=language/literals-duration)
