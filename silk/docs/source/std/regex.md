# `std::regex`

Status: **Implemented**.

This module provides regular expression helpers built on top of:

- the `regexp` primitive (compiled regex bytecode view), and
- a boxed/owned `RegExp` type for runtime-compiled patterns.

Regex literals are part of the language surface:

- `/pattern/flags` produces a `regexp` value, compiled at compile time (see
  `docs/language/literals-regexp.md`).

## API (Implemented)

The initial `std::regex` surface is intentionally small and focuses on:

- basic matching (`is_match`, `exec`, `match_first`),
- runtime compilation (`RegExp.compile(...)`),
- explicit ownership via the `RegExp` boxed type.

```silk
module std::regex;

export struct ExecResult {
  // `0` = no match, `1` = match, negative values are runtime errors.
  code: int,
  start: int,
  end: int,
}

export fn exec (re: regexp, input: string) -> ExecResult;
export fn is_match (re: regexp, input: string) -> bool;
export fn match_first (re: regexp, input: string) -> string?;

export error CompileFailed {
  code: int,
}

export struct RegExp {
  // Owned compiled bytecode.
  value: regexp,
}

impl RegExp {
  public fn empty () -> RegExp;
  public fn compile (pattern: string, flags: string) -> std::result::Result(RegExp, CompileFailed);
  public fn as_regexp (self: &RegExp) -> regexp;
}

impl RegExp as std::interfaces::Drop {
  public fn drop (mut self: &RegExp) -> void;
}
```

Notes:

- The `regexp` primitive is a non-owning `{ ptr, len }` view; regex literals
  embed compiled bytecode in rodata, and `RegExp` owns heap-allocated bytecode.
- `ExecResult.start` / `end` are byte offsets into the input `string`.
- `test` and `match` are reserved keywords in Silk; this module uses
  `is_match` and `match_first` instead.

## Related Documents

- `docs/language/literals-regexp.md` (regex literals)
- `docs/language/types.md` (`regexp`)
- `docs/std/unicode.md` (Unicode helpers used by the regex runtime)
- `docs/std/number.md` (numeric parsing/formatting)
