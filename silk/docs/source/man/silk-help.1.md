# [`silk-help(1)`](?p=man/silk-help.1) - Show Silk CLI Help

> NOTE: This is the Markdown source for the eventual man 1 page for `silk help`. The roff-formatted manpage should be generated from this content.

## Name

`silk-help` - show global or command-specific Silk CLI usage.

## Synopsis

- `silk help`
- `silk help <command>`
- `silk help --help`

## Description

`silk help` prints the same grouped terminal usage text as `silk --help`.
`silk help <command>` prints command-specific usage when `<command>` is a
recognized CLI command.

Subcommands also accept `--help` / `-h` directly. For example, these forms are
equivalent:

```sh
silk help build
silk build --help
silk build -h
```

When `silk help <query>` is not a recognized command, the CLI falls back to the
manual-page resolver. This lets common documentation queries continue through
the same terminal discovery surface used by `silk man`.

## Options

- `--help`, `-h` - show `help` command usage and exit.

## Examples

```sh
# Show global usage.
silk help

# Show build command usage.
silk help build

# Show formatter usage.
silk help format
```

## Exit Status

- `0` when help or a resolved manual page is printed successfully.
- non-zero when the command/query cannot be resolved or the invocation is
 invalid.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-man(1)`](?p=man/silk-man.1)
- [cli silk](?p=compiler/cli-silk)
