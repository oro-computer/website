---
layout: "docs"
description: "slg is a fast recursive line grep utility for files and directories."
docsCollection: "slg"
section: "overview"
order: 0
sourcePath: "start.md"
githubRepo: "oro-computer/slg"
githubRef: "master"
---

# slg Docs

[`slg`](/slg/docs/cli/slg/) is a fast recursive line grep utility for files and directories.

It is a filesystem-first CLI in the `ag` / `rg` class: search with regex or literals, list candidate files without searching content, honor ignore files and default skip lists, and tune parallel traversal explicitly when the tree is large enough to justify it.

This docs set is written from the downstream CLI perspective:

- **Guides** — build, install, and adopt [`slg`](/slg/docs/cli/slg/) in real grep workflows.
- **CLI** — exact parsing rules, input types, matching semantics, traversal, parallelism, output, and diagnostics.
- **Man pages** — reader-friendly `slg(1)` with the same public surface as the shipped manual.

## Quick start

```bash
cd slg
silk build --package .
install -m 0755 build/bin/slg ~/.local/bin/slg
slg --help
```

## First commands

```bash
slg TODO src
slg -F "TODO:" .
slg --files --max-depth 0 src
slg --hidden --no-ignore-vcs "needle" .
slg --stats error .
```

## What [`slg`](/slg/docs/cli/slg/) accepts

- Search mode: `slg [options] <pattern> [path ...]`
- File-list mode: `slg --files [options] [path ...]`
- Roots are local filesystem paths only: regular files or directories
- If no paths are provided, [`slg`](/slg/docs/cli/slg/) uses the current directory (`.`)
- `--` ends option parsing
- `-` is just a literal positional value, not stdin shorthand
- There is no rc/config file layer; runtime behavior is controlled by flags plus `NO_COLOR`

## Recommended reading path

1. [Getting started](/slg/docs/guides/getting-started/)
2. [`slg`](/slg/docs/cli/slg/)
3. [Input types and parsing](/slg/docs/cli/input-types-and-parsing/)
4. [Patterns and matching](/slg/docs/cli/patterns-and-matching/)
5. [Traversal and ignores](/slg/docs/cli/traversal-and-ignores/)
6. [Parallelism](/slg/docs/cli/parallelism/)
7. [Output and exit codes](/slg/docs/cli/output-and-exit-codes/)
8. [Options reference](/slg/docs/cli/options-reference/)
9. [Diagnostics](/slg/docs/cli/diagnostics/)
10. [`slg(1)`](/slg/docs/man/slg-1/)
