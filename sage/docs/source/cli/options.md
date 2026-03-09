# Options

This page documents every public CLI flag on `sage`.

## General

- `-h`, `--help` — show help and exit
- `-V`, `--version` — show version and exit
- `-v`, `--verbose` — verbose logging to `stderr`; also raises the default plugin console threshold to `debug`
- `--` — end option parsing

## Standalone modes

- `--compile-cache` — compile syntax sources from `XDG_CONFIG_HOME/sage/syntax` into the syntax cache
- `--list-syntax` — print compiled syntax keys, one per line
- `--index-only [PATH|-]` — build the background line index, print stats, and exit

## Plugin control

- `--no-plugins` — disable JavaScript plugins
- `--plugins-dir PATH` — load plugins from `PATH`, unless `SAGE_PLUGINS_DIR` is set

## UI and theme

- `--color MODE` — `auto`, `always`, or `never`
- `--no-color` — same as `--color never`
- `--theme NAME` — `default`, `ocean`, or `light`
- `--gutter`, `--line-numbers` — always show the line-number gutter
- `--no-gutter`, `--no-line-numbers` — never show the line-number gutter
- `--mouse` — enable mouse wheel scrolling and mouse interactions
- `--no-mouse` — disable mouse interactions
- `--no-alt-screen` — stay on the main terminal screen instead of using the alternate screen buffer

Notes:

- gutter default is `auto`
- mouse default is `on`
- alt-screen default is `on`

## Content handling and safety

- `--syntax` — enable syntax highlighting
- `--no-syntax` — disable syntax highlighting
- `--ansi` — allow ANSI SGR sequences from content
- `--no-ansi` — sanitize all escape sequences from content
- `--raw` — render bytes as-is; unsafe for untrusted input
- `--binary` — allow NUL bytes in input

Important interactions:

- `--ansi` is on by default
- when syntax highlighting is active, `sage` disables content-SGR pass-through to avoid mixing two SGR streams
- `--raw` bypasses the safety sanitization path

## Search

- `-R`, `--regex` — use regex search
- `-i`, `--ignore-case` — case-insensitive search

Defaults:

- search is literal by default
- search is case-sensitive by default

## Configuration files

- `--rc PATH` — read configuration from `PATH`
- `--no-rc` — do not read any config file

Load order and precedence are covered in [Configuration](?p=cli/configuration).

## Example option sets

Safe, minimal session:

```bash
sage --no-plugins --no-mouse --no-ansi README.md
```

High-contrast, always-colored UI:

```bash
sage --color always --theme ocean README.md
```

Regex search defaults, light theme:

```bash
sage -R --theme light src/
```

Index-only perf run:

```bash
sage --verbose --index-only large.log
```

