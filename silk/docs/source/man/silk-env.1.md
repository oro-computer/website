# [`silk-env(1)`](?p=man/silk-env.1) — Print `silk` CLI Environment

> NOTE: This is the Markdown source for the eventual man 1 page for `silk env`. The roff-formatted manpage should be generated from this content.

## Name

`silk-env` — print key environment variables consulted by the `silk` CLI.

## Synopsis

- `silk env`

## Description

`silk env` prints a list of key environment variables consulted by the `silk` CLI for configuration and debugging. The output is intended to be easy to paste into bug reports.

## Output format

- One `NAME=value` entry per line.
- Unset variables are printed as `NAME=<unset>`.
- Variables set to an empty string are printed as `NAME=<empty>`.

## Variables

The output includes, at minimum:

| Variable | Details |
| --- | --- |
| `SILK_DEBUG_BACKEND` | enable backend debug output when set to a non-empty, non-`0` value. |
| `SILK_DEBUG_BACKEND_ENUMS` | enable enum-lowering debug output. |
| `SILK_STD_ROOT` | override stdlib root used to resolve `import std::...;`. |
| `SILK_STD_LIB` | override stdlib archive used for linking (`libsilk_std.a`). |
| `SILK_Z3_LIB` | override Z3 dynamic library path used for Formal Silk verification. |
| `SILK_VERIFY_JOBS` | override the number of worker threads used for Formal Silk verification (default: auto; capped at 8). |
| `SILK_PACKAGE_PATH` | package search path for bare-specifier imports. |
| `SILK_GUIDE_DB` | override the guide database path used by `silk guide`. |
| `SILK_GUIDE_PRINTER` | override the source printer command used by `silk guide --show` when `--printer` is not provided. |
| `SILK_ELF_INTERP` | override the ELF `PT_INTERP` dynamic loader path used for `linux-x86_64` outputs when emitting dynamically-linked executables/shared libraries. |
| `PREFIX` | installation prefix used for the system package search root (`PREFIX/lib/silk`) and as the default prefix for `silk build install` / `silk build uninstall` when `-p/--prefix` is not provided. |
| `SILK_WORK_DIR` | override compiler work directory root (defaults to `.silk`). |
| `SILK_CACHE_AUTO_HEAL` | enable/disable built-in healing of recognized managed cache entries during normal builds (default: enabled). |
| `SILK_CACHE_AUTO_PRUNE` | enable/disable built-in pruning of recognized managed cache entries during normal builds (default: enabled). |
| `SILK_CACHE_MAX_BYTES` | maximum size of recognized managed cache entries before size-based pruning runs (default: `2147483648`, or `2 GiB`; `0` disables size pruning). |
| `SILK_CACHE_MAX_AGE` | maximum age of recognized managed cache entries before age-based pruning runs (default: `30d`; `0` disables age pruning). |
| `SILK_CACHE_KEEP_RECENT` | preserve at least this many most-recently-used recognized managed cache entries during pruning (default: `64`). |
| `SILK_REPL_HISTORY` | override REPL history path. |
| `SILK_TEST_TIMEOUT_MS` | per-top-level-test process timeout in milliseconds (default: `30000`). |
| `SILK_TEST_JOBS` | override the number of test processes run in parallel (default: `1`; `0` means auto; capped at 8). Overridden by `silk test --jobs`. |
| `SILK_TEST_MAX_OUTPUT_BYTES` | maximum bytes of stdout/stderr captured per test process for diagnostics (default: `1048576`). Output beyond this limit is truncated. |
| `SILK_RT_LIBDIR` | override search directory for bundled runtime archives (`libsilk_rt*.a`). |
| `SILK_CC` / `CC` | select host C compiler for `silk cc` and `.c` inputs during `silk build`. |
| `MANPAGER` / `PAGER` / `TERM` / `NO_COLOR` | paging and rendering configuration for `silk man` and diagnostic output. |

## Examples

```sh
silk env
```

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`silk-cc(1)`](?p=man/silk-cc.1)
- [`silk-build(1)`](?p=man/silk-build.1)
