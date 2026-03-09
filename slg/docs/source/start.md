# slg Docs

`slg` is a fast recursive line grep utility for files and directories.

It is a filesystem-first CLI in the `ag` / `rg` class: search with regex or literals, list candidate files without searching content, honor ignore files and default skip lists, and tune parallel traversal explicitly when the tree is large enough to justify it.

This docs set is written from the downstream CLI perspective:

- **Guides** — build, install, and adopt `slg` in real grep workflows.
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

## What `slg` accepts

- Search mode: `slg [options] <pattern> [path ...]`
- File-list mode: `slg --files [options] [path ...]`
- Roots are local filesystem paths only: regular files or directories
- If no paths are provided, `slg` uses the current directory (`.`)
- `--` ends option parsing
- `-` is just a literal positional value, not stdin shorthand
- There is no rc/config file layer; runtime behavior is controlled by flags plus `NO_COLOR`

## Recommended reading path

1. [Getting started](?p=guides/getting-started)
2. [`slg`](?p=cli/slg)
3. [Input types and parsing](?p=cli/input-types-and-parsing)
4. [Patterns and matching](?p=cli/patterns-and-matching)
5. [Traversal and ignores](?p=cli/traversal-and-ignores)
6. [Parallelism](?p=cli/parallelism)
7. [Output and exit codes](?p=cli/output-and-exit-codes)
8. [Options reference](?p=cli/options-reference)
9. [Diagnostics](?p=cli/diagnostics)
10. [`slg(1)`](?p=man/slg-1)
