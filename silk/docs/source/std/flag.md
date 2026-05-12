# `std::flag`

`std::flag` provides a small, robust command
line argument parser modeled after Go’s `flag` package, but shaped to match
`std::` conventions (explicit `Result(...)` errors, no leaky out-params, and a
clear separation between flags, positionals, and `--` rest arguments).

`std::flag` is intended for programs that can build a `std::args::Args` view,
typically from a native hosted entrypoint:

```silk
fn main (argc: int, argv: u64) -> int { ... }
```

and the current `std::args::Args` view.

On `wasm32-wasi`, executable entrypoints remain `fn main () -> int`; use
`std::args::current()` (or `std::args::Args.init(std::args::argc(),
std::args::argv())`) to construct the same `Args` value before calling
`FlagSet.parse_args(...)`.

See also:

- [args](?p=std/args) (argv helpers)
- [conventions](?p=std/conventions) (error/ownership conventions)
- [result](?p=std/result) (`Result(T, E)` and `Ok(...)`/`Err(...)` match usage)

## Parsing rules

Given an argv slice `args[start..]` (typically `start = 1` to skip `argv[0]`):

- `--` terminates **flag parsing**; arguments after `--` are captured as
 **rest** and are never interpreted as flags.
- Before `--`:
 - tokens beginning with `--` or `-` are parsed as flags **whenever** they
 match a declared flag name or alias (`--name`, `--name=value`, `-name`,
 `-name=value`, `-a`, `-a=value`),
 - a lone `-` is captured as a positional token,
 - tokens that do not begin with `-` are captured as positional tokens,
 - tokens that lexically look like negative integer literals (for example
 `-7`) are captured as positional tokens when they do not match a declared
 flag.
- Unknown dash-prefixed tokens that are neither declared flags nor negative
 integer literals are rejected as `UnknownFlag`.

This keeps flags usable before or after subcommands without losing typo
checking. When a CLI needs to pass arbitrary dash-prefixed positional strings,
use `--` to start the raw rest segment explicitly.

## Exported API

```silk
module std::flag;

import args from "std/args";
enum FlagErrorKind { ... }
enum FlagValueKind { Bool, Int, I64, U64, String }

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

struct FlagInfo {
  index: i64,
  kind: FlagValueKind,
  name: string,
  alias: string,
  usage: string,
}

struct FlagIter { ... }

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

impl FlagSet {
  public fn get_flag_name (self: &FlagSet, index: i64) -> string;
  public fn get_flag_alias (self: &FlagSet, index: i64) -> string;
  public fn get_flag_usage (self: &FlagSet, index: i64) -> string;
  public fn iter (self: &FlagSet) -> FlagIter;
}

impl FlagIter as std::interfaces::Iterator(FlagInfo) {
  public fn next (mut self: &FlagIter) -> FlagInfo?;
}
```

Notes:

- Flag/positional “handles” (`BoolFlag`, `PosString`, …) are small, copyable
 indices into the owning `FlagSet`. This keeps the API explicit and avoids
 exporting raw pointers.
- Handle structs have safe defaults (their `index` field defaults to an invalid
 sentinel). `FlagSet.get_*` methods treat invalid handles as “missing” and
 return zero values (`false`, `0`, or `""`) rather than reading out of bounds.
- Declared flag metadata may be retrieved from the owning `FlagSet` via
 `get_flag_name(handle.index)`, `get_flag_alias(handle.index)`, and
 `get_flag_usage(handle.index)` when building usage/help output (or via
 `handle.usage(fs)` for usage text specifically).
- `FlagSet.iter()` enumerates declared flags in declaration order and yields
 `FlagInfo` values carrying the declared index, value kind, name, alias, and
 usage string.
- `FlagIter` borrows metadata storage owned by the `FlagSet`. Keep the
 `FlagSet` alive, and do not declare more flags on it, while an iterator
 snapshot is in use.
- `ParsedArgs` provides views of:
 - all positional tokens before and after interspersed flags (including the
 `--` rest segment),
 - and raw rest tokens (after `--`).
- `ParsedArgs` borrows its positional index bookkeeping from the owning
 `FlagSet`; keep the `FlagSet` alive until you are done reading positional
 tokens from `ParsedArgs`.
- Typed values are retrieved from the `FlagSet` via the returned handles.
- Flag declarations prefer options structs (`BoolOptions`, `IntOptions`, ...).
- Options structs use `default_value` because `default` is a reserved keyword.

## Example

```silk
import args from "std/args";
import flag from "std/flag";
import { println } from "std/io";

fn main (argc: int, argv: u64) -> int {
  let a = std::args::Args.init(argc, argv);
  let mut fs = std::flag::FlagSet.init();

  let verbose_r = fs.bool({ name: "verbose", alias: "v", default_value: false, usage: "enable verbose logging" });
  let out_r = fs.string({ name: "out", alias: "", default_value: "out.txt", usage: "output path" });
  let input_r = fs.positional_string("input", "input file");

  match (verbose_r) {
    Ok(verbose) => {
      match (out_r) {
        Ok(out) => {
          match (input_r) {
            Ok(input) => {
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
            },
            Err(_) => {
              fs.drop();
              return 2;
            },
          }
        },
        Err(_) => {
          fs.drop();
          return 2;
        },
      }
    },
    Err(_) => {
      fs.drop();
      return 2;
    },
  }
}
```

## Declared flag metadata

`FlagSet` now exposes the declared flag surface directly:

- `get_flag_name(index)` returns the canonical long name.
- `get_flag_alias(index)` returns the declared alias, or `""` when the flag has
 no alias or the index is invalid.
- `get_flag_usage(index)` returns the usage text, or `""` for an invalid index.
- `iter()` returns a non-destructive iterator over all declared flags in
 declaration order.

This is intended for help/usage generation and for generic tooling that only
has a `FlagSet` plus flag handles.

```silk
let mut fs = std::flag::FlagSet.init();
let verbose_r = fs.bool({ name: "verbose", alias: "v", default_value: false, usage: "enable verbose logging" });
let out_r = fs.string({ name: "out", alias: "o", default_value: "out.txt", usage: "output path" });

if verbose_r.is_ok() && out_r.is_ok() {
  for info in fs.iter() {
    if info.alias != "" {
      println("--{} (-{}): {}", info.name, info.alias, info.usage);
    } else {
      println("--{}: {}", info.name, info.usage);
    }
  }
}
```

## Design goals

- **Typed flags**: parse `bool`, `int`, `i64`, `u64`, and `string` values.
- **Typed positionals**: declare and parse positional arguments (required and
 optional), separate from flags.
- **`--` rest**: support `--` to stop parsing flags and expose the remaining
 arguments as a “rest” list for forwarding to subcommands/tools.
- **Interspersed flags**: continue recognizing declared flags before `--` even
 after earlier positional tokens, so CLI subcommands can still accept global
 flags after the subcommand name.
- **Stable errors**: return a structured `FlagFailed` value (no `errno`, no
 sentinel returns, no hidden error state).
- **No hidden allocation**: the parser stores only string *views* into the
 original argv bytes; it does not copy argument strings.
