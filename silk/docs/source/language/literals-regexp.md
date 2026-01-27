# Regular Expression Literals

Regular expression literals represent `regexp` values: compiled regular
expression bytecode that can be used by `std::regex` helpers.

The regex literal syntax is modeled after JavaScript:

- `/pattern/flags`

## Implementation Status (Current Compiler Subset)

What is intended to work end-to-end (lexer → parser → checker → lowering → codegen):

- Regex literal parsing in expression-start positions: `/pattern/flags`.
- Compile-time compilation during type checking:
  - invalid patterns are rejected during type checking,
  - invalid or duplicate flags are rejected during type checking,
  - successful literals embed compiled bytecode into the output.
- The literal’s type is `regexp`.

## Syntax

### Delimiters and scanning

Regex literals are scanned by the parser (not the lexer):

- the opening delimiter is a single `/`,
- the closing delimiter is the first unescaped `/` that is **not** inside a
  character class (`[...]`),
- after the closing delimiter, the parser consumes ASCII letters as flags.

The parser does not interpret regex escapes: backslash sequences are preserved
as bytes for the regex engine.

### Empty patterns and `//`

Because `//` introduces a line comment, an empty regex literal `//` is not a
valid token sequence. Use an explicit empty pattern, for example `/(?:)/`.

## Flags

The supported flag set is intentionally small in the current subset:

- `g` — global (recorded; does not change `std::regex::matches` semantics)
- `i` — ignore case
- `m` — multiline
- `s` — dotAll
- `y` — sticky
- `d` — indices (recorded; currently not surfaced by `std::regex` helpers)

The type checker rejects:

- unknown flags,
- duplicate flags (for example `/a/ii`).

## Semantics

- A regex literal’s value is a non-owning `{ ptr, len }` view (`regexp`) into
  compiled bytecode embedded in read-only data.
- The bytecode format is owned by the runtime regex engine; `regexp` values are
  opaque and must be consumed via `std::regex`.
- In the current subset, matching is defined over the raw bytes of the input
  `string`, and match indices are byte offsets.

## Examples

### Basic `test`

```silk
import std::regex;

fn main () -> int {
  if std::regex::matches(/hello/, "hello world") {
    return 0;
  }
  return 1;
}
```

## Related Documents

- `docs/language/types.md` (`regexp`)
- `docs/language/grammar.md` (regexp literal grammar)
- `docs/std/regex.md` (runtime regex API)
