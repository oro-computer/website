# `silk-format` (1) — Format Silk Source Files

> NOTE: This is the Markdown source for the eventual man 1 page for `silk format`. The roff-formatted manpage should be generated from this content.

## Name

`silk-format` — format Silk source files.

## Synopsis

- `silk format [options] <path> [<path> ...]`
- `silk fmt [options] <path> [<path> ...]`

## Description

`silk format` rewrites Silk source files (`.slk` and `.silk`) to the canonical formatting style.

The formatter discovers project configuration by searching for `.silk/format.toml`, starting from each formatted file’s directory and walking upward to the filesystem root. The first config file found applies to that file.

## Options

- `--check` — do not write any files; exit non-zero if any file would change.
- `--help`, `-h` — show command usage and exit.
- `--` — end of options (treat following args as paths, even if they begin with `-`).

## Configuration (`.silk/format.toml`)

The formatter reads configuration from a TOML file at `.silk/format.toml`.

Supported keys (under the `[format]` table):

- `indent_style = "space" | "tab"` (default: `"space"`)
- `indent_width = <int>` (default: `2`; used only when `indent_style = "space"`)

Example:

```toml
[format]
indent_style = "space"
indent_width = 2
```

## Notes

- Multi-line string literals (including raw backtick strings) are preserved verbatim.
- The formatter does not type-check inputs; use `silk check` to validate code.

## Examples

```sh
silk fmt src
silk format --check .
```

## See Also

- `silk` (1)
- `silk-check` (1)

