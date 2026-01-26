# Numeric Literals

Numeric literals produce integer (`int`, `u8`, `i64`, …) and floating-point
(`f32`, `f64`) values.

In Silk, the sign is an operator: `-1` is a unary `-` expression applied to the
integer literal token `1`, not a distinct “negative literal” token.

## Implementation Status (Current Compiler Subset)

What works end-to-end today (lexer → parser → checker → lowering → codegen):

- Decimal integer literals: `0`, `42`, `255`.
- Integer base prefixes:
  - binary: `0b1010` / `0B1010`,
  - octal: `0o17` / `0O17`,
  - hex: `0xFF` / `0Xff`,
  - legacy octal: `017` (value 15).
- Decimal float literals with a fractional part: `0.0`, `1.5`, `10.25`.
- Unary `-` over numeric literals: `-1`, `-1.5`.
- Contextual typing:
  - integer literals default to `int`, but adopt an expected integer type
    (`u8`, `i32`, …) or time type (`Duration`, `Instant`) when a context
    provides one,
  - float literals default to `f64`, but adopt `f32`/`f64` from context.
- Duration literal tokens of the form `<number><unit>` (no whitespace) such as
  `500ms` and `1.5s` (specified in `docs/language/literals-duration.md`).
- Lowering note (current IR backend subset): unannotated local `let` bindings
  participate only in the integer subset. Prefer explicit type annotations for
  `bool` and float locals when you intend to build an executable/library.

Not implemented yet:

- Digit separators (`1_000`).
- Exponent notation (`1e6`, `1.0e-3`).
- Numeric type suffixes (`42u8`, `1.5f32`).

## Quick Reference

```silk
fn main () -> int {
  let a = 42;        // int
  let b: u8 = 42;    // u8 (typed by context)

  let x: f64 = 1.5;  // f64
  let y: f32 = 1.5;  // f32 (typed by context)

  let d: Duration = 5ms;
  let t0: Instant = 0;

  return 0;
}
```

## Surface Syntax (Current Lexer)

In the current implementation, numeric literal tokens are recognized as:

- **Integer literal**:
  - decimal digits (`[0-9]+`),
  - binary prefix: `0b` / `0B` followed by binary digits (`[01]+`),
  - octal prefix: `0o` / `0O` followed by octal digits (`[0-7]+`),
  - hex prefix: `0x` / `0X` followed by hex digits (`[0-9a-fA-F]+`),
  - legacy octal: `0[0-7]+` (for example `017`).
- **Float literal**: digits, `.`, digits (`[0-9]+ '.' [0-9]+`)

Notes:

- A float literal must have digits on both sides of the `.`:
  - `1.0` is a float literal.
  - `1.` is not a float literal in the current lexer.
  - `.5` is not a float literal; write `0.5`.
- Numeric literals must start with a digit in the current lexer.
- The `-` sign is not part of the literal token:
  - `-1` parses as unary `-` applied to the integer literal `1`.
  - `-1.5` parses as unary `-` applied to the float literal `1.5`.
- A numeric token immediately followed by a duration unit suffix (e.g. `1s`,
  `500ms`, `1.5s`) is a single `Duration` literal token, not a number token
  followed by an identifier.
- A numeric literal token may not be immediately followed by an identifier
  start character or an ASCII digit (unless the identifier characters are part
  of a duration unit suffix). For example:
  - `3in` is a lexical error (write `3 in` or `3 * in` as intended),
  - `0b102` is a lexical error (invalid binary digit),
  - `08` is a lexical error in Silk because multi-digit literals starting with
    `0` are legacy octal (use `0o10` for octal 8, or write `8` for decimal).

## Type Rules (Current Subset)

See `docs/language/types.md` for the primitive type names used below.

### Integer literals

- Without an expected type, an integer literal has type `int`.
- When a context provides an expected type that is:
  - an integer type (`u8`, `i64`, `int`, …), or
  - a time type (`Duration`, `Instant`),
  then the integer literal adopts that expected type.

Example: parameter context and “adopt the expected type”

```silk
fn id_u8 (x: u8) -> u8 {
  return x;
}

fn main () -> int {
  // `255` is contextually typed as `u8` because `id_u8` expects `u8`.
  let v: u8 = id_u8(255);
  if v != 255 {
    return 1;
  }
  return 0;
}
```

Example: time types share an `i64`-based representation in the current subset
(`docs/language/duration-instant.md`), so integer literals can be used as
`Instant`/`Duration` values via context:

```silk
fn main () -> int {
  let t0: Instant = 0;
  let d: Duration = 1s;
  let t1: Instant = t0 + d;

  let diff: Duration = t1 - t0;
  if diff != d {
    return 1;
  }
  return 0;
}
```

### Float literals

- Without an expected type, a float literal has type `f64`.
- When a context provides an expected float type (`f32` or `f64`), the literal
  adopts that expected type.

```silk
fn id_f32 (x: f32) -> f32 {
  return x;
}

fn main () -> int {
  // `1.5` is contextually typed as `f32` because `id_f32` expects `f32`.
  let v: f32 = id_f32(1.5);
  if v != 1.5 {
    return 1;
  }
  return 0;
}
```

## Common Pitfalls

- **Trying to use suffixes**: `42u8` / `1.5f32` are not supported. Use type
  annotations (`let x: u8 = 42;`) or casts (`42 as u8`).
- **Using digit separators**: `1_000` is not supported yet.
- **Using exponent notation**: `1e6` is not supported yet.
- **Writing incomplete floats**: write `1.0` (not `1.`) and `0.5` (not `.5`).
- **Mixing integers and floats implicitly**: use `as` casts (`docs/language/operators.md`)
  to convert explicitly when you need to combine integer and float values.

## Related Documents

- `docs/language/literals-duration.md` (duration literals like `5ms`, `1.5s`)
- `docs/language/duration-instant.md` (time types and operators)
- `docs/language/operators.md` (unary `-`, arithmetic, and `as` casts)
- `docs/language/types.md` (primitive numeric type names)

## Relevant Tests

- Integer literal contextual typing (`u8` parameters):
  - `tests/silk/pass_typed_params_u8_many_stack.slk`
- Integer wrap behavior in arithmetic:
  - `tests/silk/pass_typed_params_u8_wrap.slk`
  - `tests/silk/pass_unary_ops.slk`
- Float literal contextual typing (`f32` parameters):
  - `tests/silk/pass_float_f32_literal_context.slk`
- Float literal default type (`f64`):
  - `tests/silk/pass_float_literal_default_f64.slk`
- Float arithmetic and comparisons:
  - `tests/silk/pass_float_f64_arith_cmp.slk`
  - `tests/silk/pass_float_mixed_int_float_params.slk`
- Duration literals (numeric + unit suffix):
  - `tests/silk/pass_duration_literals.slk`
- Integer literal base prefixes and legacy octal:
  - `tests/silk/pass_numeric_literal_prefixes.slk`
