# Sage Docs

`sage` is a fast, ergonomic terminal pager with a strong CLI story: open one file, a directory worth of files, piped stdin, or remote content, then navigate with a responsive TUI, incremental search, syntax highlighting, and optional JavaScript plugins.

This documentation is organized around how you use `sage` from the command line:

- **Guides** — build, install, and adopt `sage` in real workflows.
- **CLI** — commands, modes, input types, options, keys, configuration, environment, syntax caches, and diagnostics.
- **JavaScript APIs** — the full QuickJS plugin surface, stable `sage:*` built-in modules, globals, events, limits, and examples.
- **Man pages** — reader-friendly versions of `sage(1)`, `sage(7)`, and `sage-plugin-api(3)`.

## Ask AI / `llms.txt`

For AI assistants and tooling:

- Whole-site pack: [`llms.txt`](../../llms.txt)
- Sage docs pack: [`sage/llms.txt`](../llms.txt)

## Quick start

Open a file:

```bash
sage README.md
```

Open every direct child file in a directory as tabs:

```bash
sage src/
```

Use `sage` as a pager for piped content:

```bash
PAGER=sage man printf
git diff | sage
```

Open remote content:

```bash
sage https://example.com/
sage ssh://user@example.com/etc/hosts
```

## Recommended reading path

1. [Getting started](?p=guides/getting-started)
2. [CLI overview (`sage`)](?p=cli/sage)
3. [Inputs and modes](?p=cli/inputs-and-modes)
4. [Options](?p=cli/options)
5. [Keys and commands](?p=cli/keys-and-commands)
6. [Configuration](?p=cli/configuration)
7. [Syntax and cache](?p=cli/syntax-and-cache)
8. [Diagnostics](?p=cli/diagnostics)
9. [JavaScript runtime overview](?p=javascript/runtime)
10. [Module index](?p=javascript/module-index)

