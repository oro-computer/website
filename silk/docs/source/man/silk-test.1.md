# `silk-test` (1) — Run Language-Level Tests


## Name

`silk-test` — discover and run language-level `test` declarations.

## Synopsis

- `silk test [options] <file> [<file> ...]`
- `silk test [options] --package <dir|manifest>`
- `silk test [options]` (when `./silk.toml` exists, behaves as if `--package .` was provided)

## Description

`silk test` discovers `test` declarations in the loaded module set and runs them, emitting TAP version 13 output.

When `--jobs` is greater than `1`, `silk test` runs test processes in parallel but keeps TAP output deterministic by buffering per-test output and printing results in the original selection order.

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
- `--feature <spec>`, `-F<spec>` — enable a build feature for `attr(feature="...")` queries and declaration gating. Repeatable.
  - Spec forms: `NAME` or `NAME=VALUE` (see [Attributes](?p=language/attributes)).
  - For package builds, you may target a specific package with `PKG/NAME` or
    `PKG/NAME=VALUE` (for example `ui/tui` or `ui/tui=false`).
- `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
- `--noheap` — reject heap allocation in the supported subset.
- `--jobs <n>`, `-j <n>` — run up to `<n>` test processes in parallel. Default: `1`. `0` means “auto” (based on CPU count). Jobs are capped at `8`.
- `--filter <pattern>` — run only tests whose test path contains `<pattern>` (substring match). The test path is the nested test name stack joined with `/` (for example `suite/case`).
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

- `PREFIX` — installation prefix used for the system package search root at `PREFIX/lib/silk` (searched last when it exists). Default: `/usr/local`.
- `SILK_PACKAGE_PATH` — primary package search path for bare-specifier imports (entries separated by `:` on POSIX, `;` on Windows). The compiler appends `PREFIX/lib/silk` as the last search path entry when it exists.
- `SILK_Z3_LIB` — path to a dynamic Z3 library used by the Formal Silk verifier.
- `SILK_VERIFY_JOBS` — override the number of worker threads used for Formal Silk verification (default: auto; capped at 8).
- `SILK_TEST_TIMEOUT_MS` — per-top-level-test process timeout in milliseconds (default: `30000`).
- `SILK_TEST_JOBS` — override the number of test processes run in parallel (default: `1`; `0` means auto; capped at 8). Overridden by `--jobs`.
- `SILK_TEST_MAX_OUTPUT_BYTES` — maximum bytes of stdout/stderr captured per test process for diagnostics (default: `1048576`). Output beyond this limit is truncated.

## Exit status

- `0` when all tests pass.
- non-zero when any test fails or the module set is invalid.

## See Also

- [`silk` (1)](?p=man/silk.1), [`silk-build` (1)](?p=man/silk-build.1)
- [`silk` CLI](?p=compiler/cli-silk)
- [Testing](?p=language/testing)
