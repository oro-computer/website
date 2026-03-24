# `std::regex`

This module provides regular expression helpers built on top of:

- the `regexp` primitive (compiled regex bytecode view), and
- a boxed/owned `RegExp` type for runtime-compiled patterns.

Regex literals are part of the language surface:

- `/pattern/flags` produces a `regexp` value, compiled at compile time (see
  `docs/language/literals-regexp.md`).

## Exported API

The initial `std::regex` surface is intentionally small and focuses on:

- basic matching (`matches`, `exec`, `match_first`),
- searching and iteration (`search`, `iter`),
- runtime compilation (`RegExp.compile(...)`),
- explicit ownership via the `RegExp` boxed type.

```silk
module std::regex;

export const EXEC_MATCH: int = 1;
export const EXEC_NO_MATCH: int = 0;
export const EXEC_ERR_MEMORY: int = -1;
export const EXEC_ERR_TIMEOUT: int = -2;
export const EXEC_ERR_INVALID_INPUT: int = -3;

export struct ExecResult {
  // Use `std::regex::EXEC_*` constants.
  code: int,
  start: int,
  end: int,
}

export fn exec (re: regexp, input: string) -> ExecResult;
export fn matches (re: regexp, input: string) -> bool;
export fn is_match (re: regexp, input: string) -> bool; // compatibility alias
export fn search (re: regexp, input: string, start: int) -> ExecResult;
export fn match_first (re: regexp, input: string) -> string?;

export struct MatchIter {
  re: regexp,
  input: string,
  input_len: i64,
  offset: int,
  done: bool,
}

export fn iter (re: regexp, input: string) -> MatchIter;

export error CompileFailed {
  code: int,
}

export struct RegExp {
  // Runtime-owned compiled bytecode when produced by `RegExp.compile(...)`.
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
  embed compiled bytecode in rodata.
- `RegExp.compile(...)` produces runtime-owned heap bytecode, and
  `RegExp.drop()` releases only that tracked runtime-owned form.
- Runtime-owned regex bytecode is allocated through the bundled-runtime
  `silk_rt_malloc_bytes(...)` surface, which stores the allocation-time
  realloc/free hooks with the allocation itself. Later `drop()` /
  `std::runtime::regex::free(...)` calls therefore still use the correct free
  path even if the embedder changes `silk_rt_set_allocator`.
- The bundled runtime allocator override is process-global. The runtime
  synchronizes allocator-hook updates and current-hook reads internally, but
  concurrent allocator changes can still affect which hook future regex
  compilation work observes.
- Wrapping a borrowed/literal/foreign `regexp` in `RegExp` does not transfer
  ownership; `RegExp.drop()` and `std::runtime::regex::free(...)` treat such
  values as safe no-ops instead of freeing arbitrary pointers.
- `ExecResult.start` / `end` are byte offsets into the input `string`.
- `ExecResult` implements `std::interfaces::Len` (`len() -> i64`), returning the
  matched byte length (`end - start`) when `code == EXEC_MATCH` and `0` otherwise.
- `EXEC_ERR_TIMEOUT` is the bounded-runtime signal for pathological matching.
  The bundled engine executes under a conservative operation budget instead of
  being allowed to backtrack without a limit.
- `EXEC_ERR_INVALID_INPUT` covers null/invalid pointers, overlarge lengths, and
  malformed foreign `regexp` bytecode rejected by the runtime wrapper before
  the bundled engine is entered.
- `test` and `match` are reserved keywords in Silk; this module uses
  `matches` and `match_first` instead.
- `MatchIter` provides `next() -> ExecResult?` and can be consumed with
  `for m in std::regex::iter(re, input) { ... }`.
  - matches are yielded as `ExecResult` values with `code == EXEC_MATCH`,
  - a runtime error (`code < 0`) is yielded once and then the iterator ends,
  - empty matches advance by 1 byte to guarantee progress.
- `RegExp.compile(...)` and compile-time regexp literals both run under the same
  conservative regexp compile stack budget. Overly deep nesting fails as an
  invalid regexp (`CompileFailed{ code: 3 }` for `RegExp.compile(...)`,
  `E2104` for literals) instead of recursing without a bound.
- At ABI boundaries, downstream C code should treat `regexp` values as opaque
  bytecode views and should only forward values produced by Silk regex literals
  or `RegExp.compile(...)`; the runtime rejects malformed foreign buffers, but
  the bytecode format itself is not a public construction API, and only
  runtime-compiled values are releasable through the regex free/drop path.

## Related Documents

- `docs/language/literals-regexp.md` (regex literals)
- `docs/language/types.md` (`regexp`)
- `docs/std/unicode.md` (Unicode helpers used by the regex runtime)
- `docs/std/number.md` (numeric parsing/formatting)
