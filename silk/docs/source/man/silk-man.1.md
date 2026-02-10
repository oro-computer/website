# `silk-man` (1) — View Manpages Derived from Source Docs

> NOTE: This is the Markdown source for the eventual man 1 page for `silk man`. The roff-formatted manpage should be generated from this content.

## Name

`silk-man` — render and view a temporary manpage for a symbol, module, package, or conceptual topic.

## Synopsis

- `silk man [options]`
- `silk man [options] <query>`
- `silk man [options] <section> <name>`
- `silk man --list`
- `silk man --search <pattern>`

## Description

`silk man` is an interactive documentation viewer. It parses Silk source files and renders a temporary manpage derived from doc comments, then displays it using the user’s pager.

`silk man` recognizes:

- conceptual pages defined by doc blocks tagged with `@misc <label>` (intended for man section 7),
- CLI pages defined by doc blocks tagged with `@cli` (intended for man section 1),
- API pages derived from declaration docs (intended for man section 3).

The doc-comment tag semantics are specified in `docs/language/doc-comments.md`.

Notes:

- You may also spell section selection as `name.<section>` (for example `silk.7`).
- `name(<section>)` is accepted but must be quoted in most shells.
- Shorthands:
  - `silk man build` opens `silk-build(1)` (same for `check`, `test`, `doc`, `man`, `cc`, `env`, `format` / `fmt`).
  - when no package is selected/resolvable, `silk man fs` is treated as `silk man std::fs` (and similarly for other top-level std modules).

## Options

- `--help`, `-h` — show command help and exit.
- `--list` — list shipped pages and common stdlib entrypoints, then exit.
- `--search <pattern>` — search shipped pages and stdlib module names, then exit.
- `--section <n>`, `-s <n>` — select the manpage section (`1`, `3`, or `7`).
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load a module set from a package manifest (`silk.toml`) rooted at the provided directory (or from the provided manifest path).
  - when omitted, and the query is not `std::...`, `silk man` searches the current working directory and its parent directories for `silk.toml` and uses the nearest match.
  - when no manifest is discoverable, `silk man` may also resolve the query from the package search path (`SILK_PACKAGE_PATH`).
- `--std-root <path>` — override the stdlib root directory used for resolving `std::...` queries.

## Environment

- `MANPAGER` / `PAGER` — controls the pager used to display the rendered output (when `man -l` is unavailable).
- `PREFIX` — installation prefix used for the system package search root at `PREFIX/lib/silk` (searched last when it exists). Default: `/usr/local`.
- `SILK_PACKAGE_PATH` — primary package search path used to resolve non-`std::` queries when no package manifest is selected or discoverable (entries separated by `:` on POSIX, `;` on Windows). The compiler appends `PREFIX/lib/silk` as the last search path entry when it exists.

## Examples

```sh
# Show a quick-start and list entrypoints.
silk man

# List shipped pages and common stdlib entrypoints.
silk man --list

# Search shipped pages + stdlib modules.
silk man --search fs

# View a shipped toolchain overview page (section 7).
silk man 7 silk

# View docs for a stdlib module.
silk man std::flag

# Shorthand for common stdlib modules (when no package is selected).
silk man fs

# View docs for a stdlib symbol.
silk man std::sqlite::Database

# Shorthand for CLI command pages.
silk man build

# View a conceptual page labeled via @misc.
silk man std::result::design
```

## Exit status

- `0` on success.
- non-zero on error (unknown query, parse errors, or pager failures).

## See Also

- `silk` (1), `silk-doc` (1)
- `docs/language/doc-comments.md`
