# [`silk-test(1)`](?p=man/silk-test.1) — Run Language-Level Tests

> NOTE: This is the Markdown source for the eventual man 1 page for `silk test`. The roff-formatted manpage should be generated from this content.

## Name

`silk-test` — discover and run language-level `test` declarations.

## Synopsis

- `silk test [options] <file> [<file> ...]`
- `silk test [options] --package <dir|manifest>`
- `silk test [options]` (when `./silk.toml` exists, behaves as if `--package .` was provided)

## Description

`silk test` discovers `test` declarations in the loaded module set and runs them, emitting TAP version 13 output.

Top-level test bodies that contain `await` are run through async test wrappers and awaited by the generated runner.

Test executables use the native host target when Silk has a host-backed executable backend for it, and otherwise fall back to `linux-x86_64`. Formal Silk target metadata in `silk test` reflects that selected execution target.

When `--jobs` is greater than `1`, `silk test` runs test processes in parallel but keeps TAP output deterministic by buffering per-test output and printing results in the original selection order.

When explicit input files are used (no `--package`), the `silk` CLI may load additional packages into the module set by resolving bare-specifier package imports (for example `import util from "util";`) from the package search path (`SILK_PACKAGE_PATH`).

## Options

- `--help`, `-h` — show command help and exit.
- `--nostd`, `-nostd` — disable stdlib auto-loading for std imports.
- `--std-root <path>` — override the stdlib root directory used to resolve `from "std/..."` module specifiers and direct std ABI imports.
- `--std-lib <path>` — select a stdlib archive path for linking hosted builds.
- `--std <path>` — alias of `--std-root` when `<path>` does not end in `.a`.
- `--std <path>.a` — alias of `--std-lib`.
- `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
- `--debug`, `-g` — enable debug build mode (also enables extra Formal Silk debug output when verification fails).
- `--feature <spec>`, `-F<spec>` — enable a build feature for `attr(feature="...")` queries and declaration gating. Repeatable.
 - Spec forms: `NAME` or `NAME=VALUE` (see [attributes](?p=language/attributes)).
 - For package builds, you may target a specific package with `PKG/NAME` or
 `PKG/NAME=VALUE` (for example `ui/tui` or `ui/tui=false`).
- `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
- `--noheap` — reject heap allocation in the supported subset.
- `--jobs <n>`, `-j <n>` — run up to `<n>` test processes in parallel. Default: `1`. `0` means “auto” (based on CPU count). Jobs are capped at `8`.
- `--filter <pattern>` — run only tests whose test path contains `<pattern>` (substring match). The test path is the nested test name stack joined with `/` (for example `suite/case`).
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load the module set from a `silk.toml` manifest instead of explicit input files. When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
 - when the root manifest enables a build module via `[build].build_module = true`, `silk test --package` runs that build module and uses the emitted manifest/module set for package tests,
 - for compatibility, package tests currently invoke the build module with the action string `build`,
 - manifest-native link metadata for the test harness (`[[target]].inputs`, `cflags`, `ldflags`, `needed`, and `runpath`) is taken from `[build].default_target` when it names a code target, otherwise the first declared code target; `kind = "man"` targets are ignored for this purpose.
 - raw manifest native sources (`.c`, `.h`, and supported `.m`) are compiled to temporary objects for the generated test harness; `.o`, `.a`, shared libraries, needed libraries, and runpaths are linked as declared.
 - hosted vendored native-input auto-linking for libsodium, mbedTLS, SQLite, and libssh2 follows the same supported-target rules as `silk build --package`.
 - if a package has no code targets, tests still run from the package source set but no manifest link metadata is applied.
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

- [`silk(1)`](?p=man/silk.1), [`silk-build(1)`](?p=man/silk-build.1)
- [cli silk](?p=compiler/cli-silk)
- [testing](?p=language/testing)
