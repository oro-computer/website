# Getting started

This guide covers the downstream story: build `sage`, install it, page real inputs, then move into configuration and plugins.

## Build from source

From a checkout of the `sage` repository:

```bash
silk build --package .
```

The pager binary is written to:

```text
./build/bin/sage
```

The build output is intended to be distributable. A typical install flow from the build directory is:

```bash
make -C build install PREFIX=/usr/local
```

## First commands

Page a file:

```bash
sage README.md
```

Page a directory as tabs:

```bash
sage src/
```

Page piped content while keeping an interactive TUI:

```bash
git show HEAD~1..HEAD | sage
```

Use it as the process pager:

```bash
PAGER=sage man printf
```

Inspect a remote document:

```bash
sage https://example.com/
```

## What `sage` accepts

`sage` accepts:

- local file paths
- directories, expanded to direct child files only
- stdin, either implicit (`... | sage`) or explicit (`sage -`)
- network URLs: `http://`, `https://`, and `ssh://`

See [Inputs and modes](?p=cli/inputs-and-modes) for the exact behavior and edge cases.

## The first keys to learn

- `q` — quit
- `/` or `Ctrl-F` — search inside the active tab
- `Ctrl-K` — find across the currently open tabs
- `Tab` / `Shift-Tab` — move between tabs
- `:` — command mode
- `L` — toggle the line-number gutter
- `?` or `h` — help overlay

See the full reference in [Keys and commands](?p=cli/keys-and-commands).

## Good first configuration

Create `~/.sagerc`:

```toml
theme = "ocean"
color = "auto"
mouse = true
syntax = true
gutter = "auto"
plugins = true
```

Then compile your syntax cache:

```bash
sage --compile-cache
```

See [Configuration](?p=cli/configuration) and [Syntax and cache](?p=cli/syntax-and-cache).

## Next

- Adopt it in shell workflows: [Pager workflows](?p=guides/pager-workflows)
- Tune the CLI surface: [Options](?p=cli/options)
- Add automation: [Plugins quickstart](?p=guides/plugins-quickstart)

