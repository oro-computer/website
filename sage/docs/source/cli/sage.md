# `sage`

`sage` is the canonical CLI entrypoint for the pager.

## Synopsis

```bash
sage [OPTIONS] [PATH ...]
sage --print [OPTIONS] [PATH ...]
sage --compile-cache
sage --list-syntax
sage --index-only [PATH|-]
```

## Primary modes

### Interactive pager

When `stdout` is a TTY, `sage` opens the TUI:

```bash
sage README.md
sage src/
printf 'hello\n' | sage
sage https://example.com/
```

Features available in this mode:

- tabs
- search and find
- syntax highlighting
- mouse support
- JavaScript plugins

### Syntax cache compiler

Compile syntax definitions from your config directory into the cache:

```bash
sage --compile-cache
```

### Safe direct output

Render one or more inputs straight to `stdout` without starting the TUI:

```bash
sage --print README.md
sage --print src/main.slk src/sage/out.slk
```

This uses Sage's safe renderer and syntax highlighter, but it does not render
the pager chrome or the line-number gutter.

### Syntax index lister

Print the compiled syntax keys:

```bash
sage --list-syntax
```

Add `--verbose` to also print key-to-cache mappings on `stderr`.

### Index-only mode

Build the background line index, print stats, and exit:

```bash
sage --index-only README.md
sage --index-only -
```

This is mostly useful for performance testing and debugging very large inputs.

### Help and version

```bash
sage --help
sage --version
```

## Examples

Use as a pager for `man`:

```bash
PAGER=sage man printf
```

Search case-insensitively:

```bash
sage -i README.md
```

Search with regex:

```bash
sage -R README.md
```

Change the theme:

```bash
sage --theme ocean README.md
sage --theme light README.md
```

Print multiple files directly:

```bash
sage --print README.md src/main.slk
```

Force safe mode for plugins:

```bash
sage --no-plugins README.md
```

## Exit status

- `0` — success
- `2` — error

See [Diagnostics](?p=cli/diagnostics) for common failure cases.

## Next

- Exact input behavior: [Inputs and modes](?p=cli/inputs-and-modes)
- Every flag: [Options](?p=cli/options)
- Keybindings and `:` commands: [Keys and commands](?p=cli/keys-and-commands)
