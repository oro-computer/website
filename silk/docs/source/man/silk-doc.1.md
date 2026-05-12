# [`silk-doc(1)`](?p=man/silk-doc.1) — Generate Documentation (Markdown or Manpages)

> NOTE: This is the Markdown source for the eventual man 1 page for `silk doc`. The roff-formatted manpage should be generated from this content.

## Name

`silk-doc` — generate documentation from doc comments in Silk sources.

## Synopsis

- `silk doc [options] <file> [<file> ...]`
- `silk doc --man [options] <query>`

## Description

`silk doc` reads Silk sources and renders documentation from Silkdoc comments (`/** ... */` and `/// ...`) attached to declarations.

It supports two modes:

- Markdown mode (default): emits Markdown documentation for one or more input files.
- Manpage mode (`--man`): renders a single roff `man(7)` page derived from doc comments and displays or writes it.

Use `silk man` when you want terminal-first discovery and viewing. Use
`silk doc --man` when you already know the exact query and want the generated
roff output as a file or build artifact.

In Markdown mode, by default `silk doc` includes exported values, types, and Formal Silk theories, plus all `struct`/`enum`/`error`/`interface` declarations. Use `--all` to include non-exported declarations.

In manpage mode, the rendered manpage section is derived from doc tags:

- `@cli` → section 1
- `@misc` → section 7
- otherwise API docs → section 3

Doc tag semantics are specified in [doc comments](?p=language/doc-comments).

## Options

- `--help`, `-h` — show command help and exit.
- `-o <path>`, `--out <path>` — write output to `<path>` (default: stdout).

Markdown mode:

- `--all` — include non-exported functions, bindings, and methods.
- `--` — end of options; treat following args as file paths (even if they begin with `-`).

Manpage mode:

- `--man` — render a roff manpage instead of Markdown.
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load a module set from a package manifest (`silk.toml`) rooted at the provided directory (or from the provided manifest path).
- `--std-root <path>` — override the stdlib root directory used for resolving `std::...` queries.

## Examples

```sh
# Generate docs for a module set.
silk doc src/main.slk src/util.slk -o api.md

# Include non-exported declarations.
silk doc --all src/main.slk -o api.md

# Render a roff manpage for a stdlib module.
silk doc --man std::flag -o std_flag.3

# Render a stdlib symbol page to a file after discovering it via `silk man --search`.
silk man --search String
silk doc --man std::strings::String -o std_strings_string.3

# Render a package-local page from the nearest or selected manifest root.
silk doc --man --package . readme -o pkg_readme.7
```

## Exit status

- `0` on success.
- non-zero on error.

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`silk-man(1)`](?p=man/silk-man.1)
- [cli silk](?p=compiler/cli-silk)
