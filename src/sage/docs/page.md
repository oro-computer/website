---
layout: "docs"
description: "sage is a fast, ergonomic terminal pager with a strong CLI story: open one file, a directory worth of files, piped stdin, or remote content, then navigate with a responsive TUI, incremental search, sy"
docsCollection: "sage"
section: "overview"
order: 0
sourcePath: "start.md"
githubRepo: "oro-computer/sage"
githubRef: "master"
---

# Sage Docs

[`sage`](/sage/docs/cli/sage/) is a fast, ergonomic terminal pager with a strong CLI story: open one file, a directory worth of files, piped stdin, or remote content, then navigate with a responsive TUI, incremental search, syntax highlighting, and optional JavaScript plugins.

This documentation is organized around how you use [`sage`](/sage/docs/cli/sage/) from the command line:

- **Guides** — build, install, and adopt [`sage`](/sage/docs/cli/sage/) in real workflows.
- **CLI** — commands, modes, input types, options, keys, configuration, environment, syntax caches, and diagnostics.
- **JavaScript APIs** — the full QuickJS plugin surface, stable `sage:*` built-in modules, globals, events, limits, and examples.
- **Man pages** — reader-friendly versions of [`sage(1)`](/sage/docs/man/sage-1/), [`sage(7)`](/sage/docs/man/sage-7/), and [`sage-plugin-api(3)`](/sage/docs/man/sage-plugin-api-3/).

## LLM documentation packs

For AI assistants and tooling:

- Whole-site pack: [`llms.txt`](/llms.txt)
- Sage docs pack: [`sage/llms.txt`](/sage/llms.txt)

## Quick start

Open a file:

```bash
sage README.md
```

Open every direct child file in a directory as tabs:

```bash
sage src/
```

Use [`sage`](/sage/docs/cli/sage/) as a pager for piped content:

```bash
PAGER=sage man printf
git diff | sage
```

Open remote content:

```bash
sage https://example.com/
sage ssh://user@example.com/etc/hosts
```

Render directly to `stdout` without entering the TUI:

```bash
sage --print README.md
```

## Recommended reading path

1. [Getting started](/sage/docs/guides/getting-started/)
2. [CLI overview (`sage`)](/sage/docs/cli/sage/)
3. [Inputs and modes](/sage/docs/cli/inputs-and-modes/)
4. [Options](/sage/docs/cli/options/)
5. [Keys and commands](/sage/docs/cli/keys-and-commands/)
6. [Configuration](/sage/docs/cli/configuration/)
7. [Syntax and cache](/sage/docs/cli/syntax-and-cache/)
8. [Diagnostics](/sage/docs/cli/diagnostics/)
9. [JavaScript runtime overview](/sage/docs/javascript/runtime/)
10. [Module index](/sage/docs/javascript/module-index/)
