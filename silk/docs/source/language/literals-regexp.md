# Regular Expression Literals

Regular expression literals represent `regexp` values: compiled regular
expression bytecode that can be used by `std::regex` helpers.

The regex literal syntax is modeled after JavaScript:

- `/pattern/flags`

## Notes

What is intended to work end-to-end (lexer → parser → checker → lowering → codegen):

- Regex literal parsing in expression-start positions: `/pattern/flags`.
- Compile-time compilation during type checking:
 - invalid patterns are rejected during type checking,
 - invalid or duplicate flags are rejected during type checking,
 - overly deep regexp nesting is rejected within a conservative compile
 stack budget instead of recursing without a bound in the embedder,
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

The supported flag set is intentionally small in the Supported forms:

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
- A literal `regexp` is borrowed data, not a heap-owned regex object:
 `std::regex::RegExp.compile(...)` is the owning/runtime-allocated path, while
 wrapping a literal in `std::regex::RegExp` does not transfer ownership.
- When a foreign ABI caller supplies a malformed `regexp` buffer to
 `std::regex`, the runtime rejects it as invalid input before entering the
 bundled engine.
- If a literal/borrowed/foreign `regexp` is later passed to the low-level
 regex free path, the runtime ignores it safely instead of freeing arbitrary
 pointers.
- In the Supported forms, matching is defined over the raw bytes of the input
 `string`, and match indices are byte offsets.
- Literal compilation uses the same conservative regexp compile stack budget as
 runtime `std::regex::RegExp.compile(...)`; excessively deep patterns are
 rejected as `E2104` (`invalid regexp literal`).

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

- [types](?p=language/types) (`regexp`)
- [grammar](?p=language/grammar) (regexp literal grammar)
- [regex](?p=std/regex) (runtime regex API)
