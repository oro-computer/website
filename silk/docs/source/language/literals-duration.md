# Duration Literals

The `Duration` and `Instant` types have specialized literal support.

## Syntax (Implemented Subset)

Duration literals are written as a decimal integer or decimal float immediately
followed by a unit suffix:

- Examples:
  - `10ns`
  - `250us`
  - `5ms`
  - `1s`
  - `1.5s`
  - `2min`
  - `1h`

The unit suffix is part of the literal token; the lexer must not split it into
an integer token followed by an identifier.

## Units (Implemented)

The current implementation recognizes the following suffixes:

- `ns` — nanoseconds
- `us` — microseconds
- `ms` — milliseconds
- `s` — seconds
- `min` — minutes
- `h` — hours
- `d` — days

## Semantics (Implemented)

Duration literals evaluate to a `Duration` value represented as an `i64`
nanosecond count.

- For integer forms (e.g. `5ms`), the value is scaled exactly.
- For floating-point forms (e.g. `1.5s`), the value is scaled and then rounded
  toward zero to an integral nanosecond count.

If the scaled value does not fit in `i64`, compilation fails.

Compiler requirements:

- Implement lexing rules that distinguish unit suffixes from identifiers.
- Map duration literals to the `Duration` type with correct unit scaling.
- Ensure constant-evaluation behavior (rounding, overflow) matches the spec.
