# `silk-test` (1) — Run Language-Level Tests

> NOTE: This is the Markdown source for the eventual man 1 page for `silk test`. The roff-formatted manpage should be generated from this content.

## Name

`silk-test` — discover and run language-level `test` declarations.

## Synopsis

- `silk test [options] <file> [<file> ...]`
- `silk test [options] --package <dir|manifest>`
- `silk test [options]` (when `./silk.toml` exists, behaves as if `--package .` was provided)

## Description

`silk test` discovers `test` declarations in the loaded module set and runs them, emitting TAP version 13 output.

When explicit input files are used (no `--package`), the `silk` CLI may load additional packages into the module set by resolving bare-specifier package imports (for example `import util from "util";`) from the package search path (`SILK_PACKAGE_PATH`).

## Options

- `--help`, `-h` — show command help and exit.
- `--nostd`, `-nostd` — disable stdlib auto-loading for `import std::...;`.
- `--std-root <path>` — override the stdlib root directory used to resolve `import std::...;`.
- `--std-lib <path>` — select a stdlib archive path for linking hosted builds.
- `--std <path>` — alias of `--std-root` when `<path>` does not end in `.a`.
- `--std <path>.a` — alias of `--std-lib`.
- `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
- `--debug`, `-g` — enable debug build mode (also enables extra Formal Silk debug output when verification fails).
- `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
- `--noheap` — reject heap allocation in the supported subset.
- `--filter <pattern>` — run only tests whose display name contains `<pattern>` (substring match).
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load the module set from a `silk.toml` manifest instead of explicit input files. When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
- `--` — end of options; treat following args as file paths (even if they begin with `-`).

## Examples

```sh
# Run tests in an explicit module set.
silk test src/main.slk src/util.slk

# Run package tests from the current directory manifest (implicit --package .).
silk test

# Run package tests from the current directory manifest.
silk test --package .

# Run only tests whose name contains "url".
silk test --package . --filter url
```

## Environment

- `SILK_PACKAGE_PATH` — PATH-like list of package root directories used to resolve bare-specifier package imports (entries separated by `:` on POSIX).

## Exit status

- `0` when all tests pass.
- non-zero when any test fails or the module set is invalid.

## See Also

- `silk` (1), `silk-build` (1)
- `docs/compiler/cli-silk.md`
- `docs/language/testing.md`
