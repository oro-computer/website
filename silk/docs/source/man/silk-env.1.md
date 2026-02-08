# `silk-env` (1) — Print `silk` CLI Environment

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

- `SILK_DEBUG_BACKEND` — enable backend debug output when set to a non-empty, non-`0` value.
- `SILK_DEBUG_BACKEND_ENUMS` — enable enum-lowering debug output.
- `SILK_STD_ROOT` — override stdlib root used to resolve `import std::...;`.
- `SILK_STD_LIB` — override stdlib archive used for linking (`libsilk_std.a`).
- `SILK_Z3_LIB` — override Z3 dynamic library path used for Formal Silk verification.
- `SILK_PACKAGE_PATH` — package search path for bare-specifier imports.
- `SILK_WORK_DIR` — override compiler work directory root (defaults to `.silk`).
- `SILK_REPL_HISTORY` — override REPL history path.
- `SILK_RT_LIBDIR` — override search directory for bundled runtime archives (`libsilk_rt*.a`).
- `SILK_CC` / `CC` — select host C compiler for `silk cc` and `.c` inputs during `silk build`.
- `MANPAGER` / `PAGER` / `TERM` / `NO_COLOR` — paging and rendering configuration for `silk man` and diagnostic output.

## Examples

```sh
silk env
```

## See Also

- `silk` (1)
- `silk-cc` (1)
- `silk-build` (1)
