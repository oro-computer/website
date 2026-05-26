# [`silk-check(1)`](?p=man/silk-check.1) — Parse and Type-Check

> NOTE: This is the Markdown source for the eventual man 1 page for `silk check`. The roff-formatted manpage should be generated from this content.

## Name

`silk-check` — parse and type-check a Silk module set.

## Synopsis

- `silk check [options] <file> [<file> ...]`
- `silk check [options] --package <dir|manifest>`
- `silk check [options] (when ./silk.toml exists, implies --package .)`

## Description

`silk check` parses and type-checks a module set and reports any diagnostics. It does not emit an output artifact.

Use `--json` when a caller needs a schema-versioned result or diagnostic
packet instead of terminal prose. The JSON surface is intended for editors, CI,
and automation that should not scrape human-readable diagnostics.

To check a package manifest (`silk.toml`), pass `--package` / `--pkg` and omit explicit input files. When no input files are provided and `--package` is omitted, but `./silk.toml` exists, `silk check` behaves as if `--package .` was provided.

When explicit input files are used (no `--package`), the `silk` CLI may load additional packages into the module set by resolving unquoted package imports (for example `import util;` or `import util from util;`) from the package search path (`SILK_PACKAGE_PATH`).

## Options

- `--help`, `-h` — show command help and exit.
- `--json` — emit newline-terminated JSON result or diagnostic packets on stdout.
- `--verify` — enable Formal Silk verification for modules that contain Formal Silk directives.
- `--no-verify` — disable Formal Silk verification (default).
- `--nostd`, `-nostd` — disable stdlib auto-loading for `import std::...;`.
- `--std-root <path>` — override the stdlib root directory used to resolve `import std::...;`.
- `--std <path>` — alias of `--std-root` when `<path>` does not end in `.a`.
- `--std-lib <path>` — accepted for consistency; ignored by `check`.
- `--std <path>.a` — accepted for consistency; ignored by `check`.
- `--arch <arch>` — shorthand target selector (mutually exclusive with `--target`). This affects `OS_PLATFORM` / `OS_ARCH` and `attr(...)` conditional compilation during checking.
- `--target <triple>` — target triple (mutually exclusive with `--arch`). This affects `OS_PLATFORM` / `OS_ARCH` and `attr(...)` conditional compilation during checking.
- `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`; valid only with `--verify`).
- `--debug`, `-g` — emit Z3 debug output and write `.smt2` dumps for failing Formal Silk obligations (valid only with `--verify`).
- `--feature <spec>`, `-F<spec>` — enable a build feature for `attr(feature="...")` queries and declaration gating. Repeatable.
 - Spec forms: `NAME` or `NAME=VALUE` (see [attributes](?p=language/attributes)).
 - For package builds, you may target a specific package with `PKG/NAME` or
 `PKG/NAME=VALUE` (for example `ui/tui` or `ui/tui=false`).
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load the module set from a `silk.toml` manifest instead of explicit input files.
 - when the root manifest enables a build module via `[build].build_module = true`, `silk check --package` runs that build module and checks the emitted manifest/module set instead of the raw `silk.toml`,
 - for compatibility, package checks currently invoke the build module with the action string `build`.
- `--` — end of options; treat following args as file paths (even if they begin with `-`).

## Examples

```sh
# Check a single-file program.
silk check main.slk

# Check a module set.
silk check src/main.slk src/util.slk

# Check the current directory as a package (implicit; requires ./silk.toml).
silk check

# Check the current directory as a package (explicit).
silk check --package .

# Check a module and emit a machine-readable result packet.
silk check --json main.slk
```

## JSON Output

`silk check --json` emits a single success packet when checking succeeds:

```json
{"schemaVersion":1,"command":"check","ok":true,"diagnostics":[],"summary":"ok: main.slk"}
```

Diagnostics emitted through the compiler diagnostic path use the same packet
shape with `ok: false` and one or more diagnostic entries. Each entry includes
`severity`, `code`, `message`, `span`, `detail`, `notes`, and `helps`.

## Environment

- `PREFIX` — installation prefix used for the system package search root at `PREFIX/lib/silk` (searched last when it exists). Default: `/usr/local`.
- `SILK_PACKAGE_PATH` — primary package search path for bare-specifier imports and pathless manifest dependencies (entries separated by `:` on POSIX, `;` on Windows). During package graph work, relative entries are resolved from the importing package root and then upward to the graph root. The compiler appends `PREFIX/lib/silk` as the last search path entry when it exists; dotted dependency keys such as `my.dep.b` map to slash directories such as `my/dep/b`.
- `SILK_Z3_LIB` — path to a dynamic Z3 library used by the Formal Silk verifier when `--verify` is enabled.
- `SILK_VERIFY_JOBS` — override the number of worker threads used for Formal Silk verification (default: auto; capped at 8).

## Exit status

- `0` on success.
- non-zero on error.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-build(1)`](?p=man/silk-build.1), [`silk-graph(1)`](?p=man/silk-graph.1)
- [cli silk](?p=compiler/cli-silk)
- [diagnostics](?p=compiler/diagnostics)
