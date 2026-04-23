# [`silk-man(1)`](?p=man/silk-man.1) — View Manpages Derived from Source Docs

> NOTE: This is the Markdown source for the eventual man 1 page for `silk man`. The roff-formatted manpage should be generated from this content.

## Name

`silk-man` — render and view a temporary manpage for a symbol, module, package, or conceptual topic.

## Synopsis

- `silk man [options]`
- `silk man [options] <query>`
- `silk man [options] <module> <symbol>`
- `silk man [options] <section> <module> <symbol>`
- `silk man [options] <section> <name>`
- `silk man --list`
- `silk man --search <pattern>`

## Description

`silk man` is an interactive documentation viewer. It resolves shipped toolchain pages, package-authored manual/documentation pages, and source-derived API docs, then displays the selected page through the user’s pager.

It is designed to be the terminal-first discovery entrypoint for both humans
and automated tooling:

- use `silk man --list` to see the shipped entry surface,
- use `silk man --search <pattern>` when you know a concept or name fragment
 but not the exact query spelling yet,
- use `silk man <query>` once you know the page, module, or public symbol you
 want,
- and use `silk doc --man <query> -o <path>` when you need the generated roff
 page as a file.

`silk man` recognizes:

- conceptual pages defined by doc blocks tagged with `@misc <label>` (intended for man section 7),
- CLI pages defined by doc blocks tagged with `@cli` (intended for man section 1),
- API pages derived from declaration docs (intended for man section 3).

The doc-comment tag semantics are specified in [doc comments](?p=language/doc-comments).

Notes:

- You may also spell section selection as `name.<section>` (for example `silk.7`).
- `name(<section>)` is accepted but must be quoted in most shells.
- API symbol pages are derived from **exported/public** declarations; non-exported declarations are intentionally omitted so docs match the public surface.
- when a package root is selected or discovered from `silk.toml`, `silk man`
 also discovers package-authored overview, documentation, and manual pages:
 - local `package.readme` paths act as the package overview page,
 - local `package.documentation` paths act as the package docs landing page,
 - package manual roots are discovered from common in-package man source trees
 and installed `share/man/man{1,3,7}` layouts.
- Shorthands:
 - `silk man build` opens `silk-build(1)` (same for `check`, `test`, `doc`, `man`, `cc`, `env`, `format` / `fmt`).
 - when no package is selected/resolvable, `silk man fs` is treated as `silk man std::fs` (and similarly for other top-level std modules).
 - when no package is selected/resolvable, `silk man io println` is treated as `silk man std::io::println`.
 - when a package root is selected/resolved, `silk man readme`, `silk man overview`, `silk man <package-name>`, and qualified aliases such as `silk man <package-name> readme` prefer the package overview page when a local `package.readme` exists.
 - when a package root is selected/resolved, `silk man docs`, `silk man documentation`, and qualified aliases such as `silk man <package-name> documentation` open the local `package.documentation` page when present.

## System manpages

When Silk is installed (for example via `zig build install`), the toolchain also installs roff manpages under the system man root so they can be opened with `man` directly:

- stdlib module pages install as `silk-<module>(3)` subpages, so `man 3 silk io` resolves to `silk-io(3)`,
- exported stdlib symbols install as `silk-<module>-<symbol>(3)` pages, for example `silk-io-println(3)`.

Note: `man` subpage resolution only joins **one** level (like `man git log` → `git-log(1)`), so multi-segment queries should use the hyphenated page name (for example `man 3 silk-io-println`).

## Discovery Workflow

Sections are used consistently across the toolchain:

- section `1` — commands and subcommands,
- section `3` — public API / stdlib modules and symbols,
- section `7` — concepts, overviews, and workflows.

Typical workflow:

1. start with `silk man` or `silk man 7 silk`,
2. run `silk man --search <pattern>` when you only know part of a name,
3. open the exact page with `silk man <query>`,
4. when you need a saved roff page, use `silk doc --man <query> -o <path>`.

## Options

- `--help`, `-h` — show command help and exit.
- `--list` — list shipped pages, common stdlib entrypoints, and package-local pages when a package root is in scope, then exit.
- `--search <pattern>` — search:
 - shipped section `1` / `3` / `7` pages,
 - stdlib module names,
 - public stdlib API symbol paths,
 - package-local pages when a package root is in scope,
 - and public root-package symbol paths when a package root is in scope,
 then exit.
- `--section <n>`, `-s <n>` — select the manpage section (`1`, `3`, or `7`).
- `--package <dir|manifest|module>`, `--pkg <dir|manifest|module>` — load a module set from a package manifest (`silk.toml`) rooted at the provided directory or manifest path; when a `.slk` / `.silk` module path is provided, `silk man` walks upward to the nearest owning `silk.toml`.
 - when omitted, and the query is not `std::...`, `silk man` searches the current working directory and its parent directories for `silk.toml` and uses the nearest match.
 - when no manifest is discoverable, `silk man` may also resolve the query from the package search path (`SILK_PACKAGE_PATH`).
 - when a package root is in scope, local `package.readme`, local `package.documentation`, and package-authored manual pages from source or installed man roots become part of the discoverable query surface.
- `--std-root <path>` — override the stdlib root directory used for resolving `std::...` queries.

## Environment

| Variable | Details |
| --- | --- |
| `MANPAGER` / `PAGER` | controls the pager used to display the rendered output when the system `man` viewer is unavailable or cannot open the generated local manpage on the current host. When stdout is not a TTY, `silk man <query>` writes the resolved roff page to stdout instead of invoking the interactive viewer. |
| `PREFIX` | installation prefix used for the system package search root at `PREFIX/lib/silk` (searched last when it exists). Default: `/usr/local`. |
| `SILK_PACKAGE_PATH` | primary package search path used to resolve non-`std::` queries when no package manifest is selected or discoverable (entries separated by `:` on POSIX, `;` on Windows). The compiler appends `PREFIX/lib/silk` as the last search path entry when it exists. |

## Examples

```sh
# Open the nearest package overview when `silk.toml` is in scope;
# otherwise show a quick-start and list entrypoints.
silk man

# List shipped pages and common stdlib entrypoints.
silk man --list

# Search shipped pages + stdlib modules/symbols.
silk man --search fs

# Search public stdlib symbols too.
silk man --search String

# View a shipped toolchain overview page (section 7).
silk man 7 silk

# View docs for a stdlib module.
silk man std::flag

# Shorthand for common stdlib modules (when no package is selected).
silk man fs

# View docs for a stdlib symbol.
silk man std::sqlite::Database
silk man std::strings::String

# View a package overview/docs page discovered from silk.toml metadata.
silk man readme
silk man docs
silk man my_pkg readme

# Module + symbol split (when no package is selected).
silk man io println
silk man 3 io println

# Use system-installed manpages (when installed).
man 3 silk io
man 3 silk-io-println

# Shorthand for CLI command pages.
silk man build

# View a conceptual page labeled via @misc.
silk man std::result::design

# Write a generated roff page to a file instead of opening it.
silk doc --man std::fs -o std_fs.3
```

## Exit status

| Status | Meaning |
| --- | --- |
| `0` | Success. |
| non-zero | Error, including unknown query, parse failure, or pager failure. |

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-doc(1)`](?p=man/silk-doc.1)
- [doc comments](?p=language/doc-comments)
