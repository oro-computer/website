# `slg` (1) — Silk Line Grep

This page is the reader-friendly website form of the shipped `slg(1)` manual.

## Name

`slg` — Silk Line Grep, a fast recursive file + pattern search tool

## Synopsis

```text
slg [options] <pattern> [path ...]
slg --files [options] [path ...]
```

## Description

`slg` recursively walks directory trees and either:

- searches file contents for matching lines
- or lists the files that would be searched

By default, the public surface treats the pattern as regex syntax.

Current implementation note:

- when a pattern contains no regex metacharacters, `slg` automatically uses the fixed matcher

Options may appear before or after positional arguments.

In search mode:

- the first positional argument is the pattern
- later positionals are root paths

In `--files` mode:

- every positional argument is a root path

If no paths are provided, `slg` uses the current directory (`.`).

Use `--` to end option parsing.

## Options

### Pattern and matching

- `-F`, `--fixed-string` — literal byte substring matching
- `-Q`, `--literal` — alias for fixed-string mode
- `--fixed-strings` — alias for fixed-string mode
- `-i`, `--ignore-case` — case-insensitive matching
- `-S`, `--smart-case` — ignore-case only when the pattern has no ASCII uppercase
- `--no-smart-case` — disable smart-case
- `-m`, `--max-count <n>` — stop after `n` matching lines per file; `0` means unlimited

### Traversal

- `--hidden` — include hidden files and directories
- `--follow` — follow symlinks
- `--max-depth <n>` — limit recursion depth; `0` means only the root
- `--no-ignore` — disable all ignore sources
- `--ignore` — re-enable all ignore sources
- `--ignore-common`, `--no-ignore-common` — control the built-in heavy-path skip list
- `--ignore-vcs`, `--no-ignore-vcs` — control skipping `.git`, `.hg`, `.svn`
- `--ignore-files`, `--no-ignore-files` — control reading `.gitignore`, `.ignore`, `.agignore`

### Parallelism

- `-j`, `--jobs <n>` — parallel task count; `0` or `auto` means automatic sizing
- `--threads <n>` — alias for `--jobs`
- `--max-workers <n>` — cap worker tasks
- `--split-depth <n>` — bound directory split depth
- `--queue-cap <n>` — bound the job queue
- `--target-jobs <n>` — stop splitting once roughly `n` subtrees are scheduled
- `--max-jobs-total <n>` — cap total enqueued jobs
- `--file-batch <n>` — files per file-batch job; used when file jobs are enabled
- `--no-file-jobs`, `--file-jobs` — disable or enable file-batch jobs
- `--parallel-files` — parallelize `--files` traversal when jobs resolve above `1`
- `--no-parallel` — same as `--jobs 1`

### File handling

- `--text` — search files that look binary

### Output

- `-l`, `--files-with-matches` — print only matching file paths
- `--heading` — print a file header before matches
- `-n`, `--line-number` — show line numbers; default on
- `--no-line-number`, `--no-numbers` — suppress line numbers
- `--column` — print the 1-based byte column; requires line numbers
- `--stats` — print summary stats to stderr
- `-q`, `--quiet` — print the first matching line and exit early
- `--files` — list files instead of searching file contents

### Color

- `--color auto|always|never`
- `--no-color`

### Meta

- `-h`, `--help`
- `-V`, `--version`

## Exit status

| Code | Meaning |
| --- | --- |
| `0` | Match found, or `--files` completed successfully. |
| `1` | No matches found. |
| `2` | Parse error, pattern error, runtime error, or output failure. |

## Environment

| Variable | Details |
| --- | --- |
| `NO_COLOR` | Disables color in `--color auto` mode. |

`slg` does not currently read a runtime config file.

## Examples

Regex search:

```bash
slg "TODO|FIXME" src
```

Literal search:

```bash
slg -F "TODO:" .
```

Hidden + VCS search:

```bash
slg --hidden --no-ignore-vcs "version" .
```

List files only:

```bash
slg --files src
```

Parallel listing:

```bash
slg --files --parallel-files --jobs 8 .
```

## Notes

- `slg` is filesystem-only
- `-` is not stdin shorthand
- matching is line-based
- binary detection is NUL-in-the-first-1024-bytes unless `--text` is set
- ignore-file support is a pragmatic subset, not full gitignore semantics

For exact downstream details, continue with:

- [Input types and parsing](?p=cli/input-types-and-parsing)
- [Patterns and matching](?p=cli/patterns-and-matching)
- [Traversal and ignores](?p=cli/traversal-and-ignores)
- [Options reference](?p=cli/options-reference)
