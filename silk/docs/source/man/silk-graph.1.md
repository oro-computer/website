# [`silk-graph(1)`](?p=man/silk-graph.1) - Inspect Module Graphs

> NOTE: This is the Markdown source for the eventual man 1 page for
> `silk graph`. The roff-formatted manpage should be generated from this
> content.

## Name

`silk-graph` - inspect the package, module, and import graph loaded by Silk.

## Synopsis

- `silk graph [options] <file> [<file> ...]`
- `silk graph [options] --package <dir|manifest>`
- `silk graph [options] (when ./silk.toml exists, implies --package .)`

## Description

`silk graph` loads the same module set as `silk check`, including package
defaults, dependency package roots, stdlib auto-loading, target metadata, and
feature-gated declarations. It is an inspection command: it does not type-check,
lower, link, or emit artifacts.

The command is useful when a human or tool needs to understand which source
files and package roots the CLI will use before invoking a heavier build or
check.

## Options

- `--help`, `-h` - show command help and exit.
- `--json` - emit a newline-terminated JSON graph packet on stdout.
- `--feature <spec>`, `-F<spec>` - enable a build feature for
 `attr(feature="...")` queries and declaration gating. Repeatable.
- `--nostd`, `-nostd` - disable stdlib auto-loading.
- `--std-root <path>` - override the stdlib root directory.
- `--std <path>` - alias of `--std-root`.
- `--arch <arch>` - shorthand target selector, mutually exclusive with
 `--target`.
- `--target <triple>` - target triple, mutually exclusive with `--arch`.
- `--package <dir|manifest>`, `--pkg <dir|manifest>` - load the module set from
 a `silk.toml` manifest instead of explicit input files.
- `--` - end of options; treat following args as file paths.

## JSON Output

The JSON packet has `schemaVersion: 1`, `command: "graph"`, the selected target,
module counts, package roots, and module entries.

Each module entry includes:

- `path` - source file path,
- `package` - declared package name, or an empty string for unqualified modules,
- `origin` - `user`, `package`, or `std`,
- `imports` - parsed import declarations with specifier, alias/name data, and
 whether string module specifiers resolve as file or package imports.

## Examples

```sh
# Inspect a single file without loading std.
silk graph --nostd main.slk

# Inspect the current package as JSON.
silk graph --json

# Inspect an explicit package for a target.
silk graph --json --target linux-x86_64 --package .
```

## Exit Status

- `0` on success.
- non-zero when arguments are invalid or graph loading fails.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-check(1)`](?p=man/silk-check.1), [`silk-build(1)`](?p=man/silk-build.1), [`silk-targets(1)`](?p=man/silk-targets.1)
- [cli silk](?p=compiler/cli-silk)
