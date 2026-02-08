# `std::flag`

Status: **Design + initial implementation**. `std::flag` provides a small, robust command
line argument parser modeled after Go’s `flag` package, but shaped to match
`std::` conventions (explicit `Result(...)` errors, no leaky out-params, and a
clear separation between flags, positionals, and `--` rest arguments).

`std::flag` is intended for programs that use the native hosted entrypoint:

```silk
fn main (argc: int, argv: u64) -> int { ... }
```

and the current `std::args::Args` view.

See also:

- `docs/std/args.md` (argv helpers)
- `docs/std/conventions.md` (error/ownership conventions)
- `docs/std/result.md` (`Result(T, E)` and `Ok(...)`/`Err(...)` match usage)

## Design goals

- **Typed flags**: parse `bool`, `int`, `i64`, `u64`, and `string` values.
- **Typed positionals**: declare and parse positional arguments (required and
  optional), separate from flags.
- **`--` rest**: support `--` to stop parsing flags and expose the remaining
  arguments as a “rest” list for forwarding to subcommands/tools.
- **Stable errors**: return a structured `FlagFailed` value (no `errno`, no
  sentinel returns, no hidden error state).
- **No hidden allocation**: the parser stores only string *views* into the
  original argv bytes; it does not copy argument strings.

## Parsing rules (current subset)

Given an argv slice `args[start..]` (typically `start = 1` to skip `argv[0]`):

- `--` terminates **flag parsing**; arguments after `--` are captured as
  **rest** and are never interpreted as flags.
- While parsing flags:
  - tokens beginning with `--` match **long names** (`--name`, `--name=value`),
  - tokens beginning with `-` match **either** a long name or a declared alias
    (`-name`, `-name=value`, `-a`, `-a=value`),
  - a lone `-` terminates flag parsing and starts positional mode (the `-` token
    itself is captured as the first positional),
  - the first token that does not begin with `-` starts **positional** mode.
- While in positional mode:
  - tokens are captured as **positionals** (even if they begin with `-`),
  - `--` may still appear to start **rest**.

This matches the common “flags first, then args” convention and avoids
misclassifying negative numbers once positional mode begins.

## Public API (initial)

```silk
module std::flag;

import std::args;
import std::result;

enum FlagErrorKind { ... }

struct FlagFailed {
  code: int,
  arg_index: int,
  detail: i64,
}

impl FlagFailed {
  public fn kind (self: &FlagFailed) -> FlagErrorKind;
  public fn arg_opt (self: &FlagFailed, args: &std::args::Args) -> string?;
  public fn arg (self: &FlagFailed, args: &std::args::Args) -> string;
}

struct BoolOptions { name: string, alias: string, default_value: bool, usage: string }
struct IntOptions { name: string, alias: string, default_value: int, usage: string }
struct I64Options { name: string, alias: string, default_value: i64, usage: string }
struct U64Options { name: string, alias: string, default_value: u64, usage: string }
struct StringOptions { name: string, alias: string, default_value: string, usage: string }

struct FlagSet { ... }

struct BoolFlag { index: i64 }
struct IntFlag { index: i64 }
struct I64Flag { index: i64 }
struct U64Flag { index: i64 }
struct StringFlag { index: i64 }

struct PosString { index: i64 }
struct PosInt { index: i64 }
struct PosI64 { index: i64 }
struct PosU64 { index: i64 }

struct ParsedArgs { ... }

export type ParseResult = std::result::Result(ParsedArgs, FlagFailed);
export type BoolFlagResult = std::result::Result(BoolFlag, FlagFailed);
export type IntFlagResult = std::result::Result(IntFlag, FlagFailed);
export type I64FlagResult = std::result::Result(I64Flag, FlagFailed);
export type U64FlagResult = std::result::Result(U64Flag, FlagFailed);
export type StringFlagResult = std::result::Result(StringFlag, FlagFailed);

export type PosStringResult = std::result::Result(PosString, FlagFailed);
export type PosIntResult = std::result::Result(PosInt, FlagFailed);
export type PosI64Result = std::result::Result(PosI64, FlagFailed);
export type PosU64Result = std::result::Result(PosU64, FlagFailed);
```

Notes:

- Flag/positional “handles” (`BoolFlag`, `PosString`, …) are small, copyable
  indices into the owning `FlagSet`. This keeps the API explicit and avoids
  exporting raw pointers.
- Handle structs have safe defaults (their `index` field defaults to an invalid
  sentinel). `FlagSet.get_*` methods treat invalid handles as “missing” and
  return zero values (`false`, `0`, or `""`) rather than reading out of bounds.
- Usage strings may be retrieved from the owning `FlagSet` via
  `get_flag_usage(handle.index)` and `get_positional_usage(handle.index)` when
  building usage/help output (or via `handle.usage(fs)`).
- `ParsedArgs` provides views of:
  - all positional tokens after flags (including the `--` rest segment),
  - and raw rest tokens (after `--`).
- Typed values are retrieved from the `FlagSet` via the returned handles.
- Flag declarations prefer options structs (`BoolOptions`, `IntOptions`, ...).
- Options structs use `default_value` because `default` is a reserved keyword.

## Example

```silk
import std::args;
import std::flag;
import { println } from "std/io";

fn main (argc: int, argv: u64) -> int {
  let a = std::args::Args.init(argc, argv);
  let mut fs = std::flag::FlagSet.init();

  let verbose_r = fs.bool({ name: "verbose", alias: "v", default_value: false, usage: "enable verbose logging" });
  let out_r = fs.string({ name: "out", alias: "", default_value: "out.txt", usage: "output path" });
  let input_r = fs.positional_string("input", "input file");

  if verbose_r.is_err() { fs.drop(); return 2; }
  if out_r.is_err() { fs.drop(); return 2; }
  if input_r.is_err() { fs.drop(); return 2; }

  let verbose: std::flag::BoolFlag = match (verbose_r) {
    Ok(v) => v,
    Err(_) => {},
  };
  let out: std::flag::StringFlag = match (out_r) {
    Ok(v) => v,
    Err(_) => {},
  };
  let input: std::flag::PosString = match (input_r) {
    Ok(v) => v,
    Err(_) => {},
  };

  let parsed_r = fs.parse_args(a, 1);
  match (parsed_r) {
    Err(e) => {
      println("flag parse error: kind={} at argv[{}]: {}", e.kind(), e.arg_index, e.arg(a));
      fs.drop();
      return 2;
    },
    Ok(p) => {
      if fs.get_bool(verbose) {
        println("out={}", fs.get_string(out));
      }
      println("input={}", fs.get_pos_string(input));

      // `--` rest args (for forwarding).
      var i: int = 0;
      while i < p.rest_count() {
        println("rest[{}]={}", i, p.rest(a, i));
        i += 1;
      }
      fs.drop();
      return 0;
    }
  }
}
```
