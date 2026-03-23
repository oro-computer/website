# `sage(1)`

`sage(1)` is the command reference for the pager itself. This page mirrors the man page in website form so downstream readers do not have to context-switch into `man`.

## Synopsis

```bash
sage [OPTIONS] [PATH ...]
sage --print [OPTIONS] [PATH ...]
sage --compile-cache
sage --list-syntax
sage --index-only [PATH]
```

## What `sage(1)` defines

### Description and modes

The man page defines the user-facing CLI modes:

- normal interactive paging
- `--print`
- `--compile-cache`
- `--list-syntax`
- `--index-only`
- `--help`
- `--version`

It also defines the two top-level execution branches:

- interactive TUI when `stdout` is a TTY
- pass-through behavior when `stdout` is not a TTY

And it defines the direct-output mode:

- `--print` for safe rendered output without entering the pager UI

### Options

`sage(1)` is the authoritative option list for:

- general flags
- plugin toggles
- UI color, theme, gutter, mouse, and alternate-screen behavior
- syntax and ANSI behavior
- raw/binary safety flags
- regex and ignore-case search defaults
- config-file selection

Read the fuller website breakdown in [Options](?p=cli/options).

### Keybindings and command mode

`sage(1)` defines:

- navigation keys
- tab keys
- search keys
- `Ctrl-K` find
- `:` command mode
- selection behavior
- `:set syntax=...` per-tab overrides

Read the fuller website breakdown in [Keys and commands](?p=cli/keys-and-commands).

### Syntax, config, environment, and files

The man page also defines:

- syntax highlighting defaults
- syntax source and cache directories
- `.sagerc` load order
- environment variables
- file locations
- exit statuses
- example invocations
- security notes for `--raw`

The fuller website references are:

- [Syntax and cache](?p=cli/syntax-and-cache)
- [Configuration](?p=cli/configuration)
- [Environment and files](?p=cli/environment-and-files)
- [Diagnostics](?p=cli/diagnostics)

## Best companion pages

- [CLI overview (`sage`)](?p=cli/sage)
- [Inputs and modes](?p=cli/inputs-and-modes)
- [Options](?p=cli/options)
- [Keys and commands](?p=cli/keys-and-commands)
- [Configuration](?p=cli/configuration)
- [Environment and files](?p=cli/environment-and-files)
- [Diagnostics](?p=cli/diagnostics)

## Upstream source

- [`man/sage.1`](https://github.com/oro-computer/sage/blob/master/man/sage.1)
