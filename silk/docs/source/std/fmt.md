# `std::fmt`

Status: **Design + initial implementation**. The initial formatting engine is implemented
in `std/fmt.slk` and is intentionally scoped to the current compiler/backend
subset (no generics, no runtime interface dispatch).

`std::fmt` provides a shared, Zig-`std.fmt`-style format-string syntax and a
small formatting engine used by `std::io::print` / `std::io::println`.

See also:

- `docs/std/io.md` (stdout printing)
- `docs/language/literals-string.md` (string literal semantics)
- `docs/language/ext.md` (current string ABI and null-termination rule)

## Format String Syntax (Zig-compatible subset)

A format string is a `string` containing literal text and **placeholders**.

### Escaping braces

- `{{` renders a literal `{`
- `}}` renders a literal `}`

### Placeholders

Placeholders are written with `{ ... }`:

- `{}` — formats the next argument (sequential).
- `{0}` — formats argument 0 (positional).
- `{d}` — formats the next argument using a specifier (here: decimal).
- `{0x}` — formats argument 0 using a specifier (here: hex lower).

Placeholders may also include **format options** after a colon `:`:

- `{:10}` — width 10 (default alignment).
- `{:>10}` — width 10, right-aligned.
- `{:=^10}` — width 10, center-aligned, filled with `=`.
- `{:04}` — width 4, zero-padded (special case: leading `0` implies `fill='0'`).

Precision is written after a dot:

- `{e:.5}` — scientific formatting with precision 5 (when supported by the value type).

### Grammar (informal)

Within `{ ... }`:

- optional **argument selector**:
  - digits: `0`, `1`, `2`, ...
  - bracketed index: `[0]`, `[1]`, ... (reserved for future named arguments; currently only numeric indices are accepted)
- optional **specifier string** (examples: `d`, `x`, `s`, `c`, `e`)
- optional `:` followed by:
  - optional `fill` + `alignment`:
    - `<` left, `^` center, `>` right
    - `fill` is any single byte placed immediately before the alignment character (example: `*^`)
  - optional `width`:
    - digits (`10`), or bracketed index (`[1]`) to take the width from another argument
  - optional `.` and optional `precision`:
    - digits (`.3`), or bracketed index (`.[1]`) to take the precision from another argument

## Current API (Implemented)

Because the language does not yet have generics, the current API uses an
explicit argument carrier type (`Arg`). With language-level varargs, the
formatter now accepts a variable number of arguments (up to the current
compiler’s varargs limit).

### `Arg`

`std::fmt::Arg` is a POD carrier used by `std::io` printing:

- `Arg.missing()` — missing argument placeholder.
- `Arg.int(value: int)` — signed integer argument.
- `Arg.i128(value: i128)` — signed 128-bit integer argument.
- `Arg.u64(value: u64)` — unsigned integer / pointer-sized argument.
- `Arg.u128(value: u128)` — unsigned 128-bit integer argument.
- `Arg.f64(value: f64)` — floating-point argument (both `f32` and `f64` coerce to this ctor).
- `Arg.f128(value: f128)` — 128-bit floating-point argument.
- `Arg.bool(value: bool)` — boolean argument.
- `Arg.char(value: char)` — Unicode scalar argument (formatted as UTF-8 bytes for `{c}` / `{u}`; invalid codepoints render as U+FFFD).
- `Arg.string(value: string)` — string argument.
- `Arg.regexp(value: regexp)` — regexp argument (currently formatted as placeholder text).
- `Arg.Region(value: Region)` — region argument (currently formatted as placeholder text).

Compiler convenience (implemented): the compiler supports an opt-in implicit
call-argument coercion mechanism for struct types that provide exported static
ctor methods (`int`/`i128`/`u64`/`u128`/`f64`/`f128`/`bool`/`char`/`string`/`regexp`/`Region`).
`std::fmt::Arg` implements these ctors, so callers can pass primitives directly
to `std::io::print` / `std::io::println` without explicit `Arg.*` wrappers.

See `docs/language/types.md` for the full rule.

### Supported specifiers (current subset)

The current formatter supports:

- `s` — string
- `d` — decimal number (`int`/`u64`/`i128`/`u128` and `f64`/`f128`)
- `b` — binary integer
- `o` — octal integer
- `x` — lowercase hex integer
- `X` — uppercase hex integer
- `e` — scientific `f64`/`f128`
- `c` — Unicode scalar (`char`) rendered as UTF-8 bytes
- `u` — Unicode scalar (`char`) rendered as UTF-8 bytes
- `any` — alias for default formatting in the current subset

When the specifier is empty (`{}`), a default is chosen based on the argument
kind.

Zig-compat note: when a width is specified (and non-zero), signed integers
include an explicit sign for non-negative values (for example `"{:4}"` formats
`123` as `"+123"`).

Current subset limitation: formatting signed integers (`int`/`i128`) in
non-decimal bases (`b`/`o`/`x`/`X`) requires non-negative values.

Float formatting is implemented for `f64` in the current subset:

- `{}` / `{d}` format as decimal by default, with an automatic scientific fallback
  for very small / very large magnitudes.
- `{e}` formats in scientific notation.
- precision (`.{N}`) controls the number of digits after the decimal point
  (default: 6), and width/alignment apply like other formatting kinds.

Hex float formatting (`{x}` on floats) and full debug formatting (`{any}`
recursing through arbitrary types) remain future work.

`f128` formatting is implemented by converting values to `f64` for formatting,
so output precision is limited to `f64` precision in the current subset.

## High-Level Formatting (`format`) (Implemented)

`std::fmt` provides a high-level convenience for producing formatted strings:

```silk
import { println } from "std/io";
import format from "std/fmt";
import std::fmt;
import std::strings;
import std::result;

type StringAllocResult = std::result::Result(std::strings::String, std::fmt::Error);

fn main () -> int {
  const a = 1;
  const b = 2;

  let hello_r: StringAllocResult = format("hello {}", "world");
  if hello_r.is_err() {
    return 1;
  }
  let mut hello: std::strings::String = match (hello_r) {
    StringAllocResult::Ok(v) => v,
    StringAllocResult::Err(_) => std::strings::String.empty(),
  };

  let sum_r: StringAllocResult = format("a + b = {}", a + b);
  if sum_r.is_err() {
    (mut hello).drop();
    return 2;
  }
  let mut sum: std::strings::String = match (sum_r) {
    StringAllocResult::Ok(v) => v,
    StringAllocResult::Err(_) => std::strings::String.empty(),
  };

  println("{}", hello.as_string());
  println("sum of {}", sum.as_string());
  (mut sum).drop();
  (mut hello).drop();
  return 0;
}
```

Signature:

```silk
export default fn format (fmt: string, ...args: Arg) -> std::result::Result(std::strings::String, std::fmt::Error);
```

Notes (current subset):

- `format` is also available as a named export (`import { format } from "std/fmt";`).
- The returned `std::strings::String` is an owned, NUL-terminated string buffer.
  - When heap-backed, it is freed on Drop (calls `std::runtime::mem::free`).
  - When region-backed (inside `with <region>` / `with <bytes>`), Drop calls `free` but `free` is a no-op for region pointers (see `docs/language/regions.md`), and region-allocated values must not outlive the region.
- Use `String.as_string()` to obtain a borrowed `string` view.
- For bounded allocations, format into caller-owned storage with `format_to_buffer_u8`.
