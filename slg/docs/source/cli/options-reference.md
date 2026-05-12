# Options reference

This page lists every public CLI flag on `slg`.

## Pattern and matching

| Flag | Applies in search mode | Applies in `--files` mode | Meaning |
| --- | --- | --- | --- |
| `-F`, `--fixed-string` | yes | parsed but has no effect | Treat the pattern as a literal byte substring |
| `-Q`, `--literal` | yes | parsed but has no effect | Alias for fixed-string mode |
| `--fixed-strings` | yes | parsed but has no effect | Alias for fixed-string mode |
| `-i`, `--ignore-case` | yes | parsed but has no effect | Case-insensitive matching |
| `-S`, `--smart-case` | yes | parsed but has no effect | Enable ignore-case only for lowercase/no-uppercase patterns |
| `--no-smart-case` | yes | parsed but has no effect | Disable smart-case |
| `-m`, `--max-count <n>` | yes | parsed but has no effect | Stop after `n` matching lines per file; `0` means unlimited |

## Traversal

| Flag | Applies in search mode | Applies in `--files` mode | Meaning |
| --- | --- | --- | --- |
| `--hidden` | yes | yes | Include hidden files and directories |
| `--follow` | yes | yes | Follow symlinks |
| `--max-depth <n>` | yes | yes | Limit recursion depth; `0` means root-only |
| `--no-ignore` | yes | yes | Disable all ignore sources |
| `--ignore` | yes | yes | Re-enable all ignore sources |
| `--ignore-common` | yes | yes | Re-enable skipping common heavy paths |
| `--ignore-vcs` | yes | yes | Re-enable skipping `.git`, `.hg`, `.svn` |
| `--ignore-files` | yes | yes | Re-enable reading ignore files |
| `--no-ignore-common` | yes | yes | Stop skipping common heavy paths |
| `--no-ignore-vcs` | yes | yes | Stop skipping VCS directories |
| `--no-ignore-files` | yes | yes | Stop reading ignore files |

## Parallelism

| Flag | Applies in search mode | Applies in `--files` mode | Meaning |
| --- | --- | --- | --- |
| `-j`, `--jobs <n>` | yes | yes | Parallel task count; `0` or `auto` means automatic sizing |
| `--threads <n>` | yes | yes | Alias for `--jobs` |
| `--max-workers <n>` | yes | yes | Cap worker tasks |
| `--split-depth <n>` | yes | yes | Limit subtree split depth |
| `--queue-cap <n>` | yes | yes | Bound the job queue |
| `--target-jobs <n>` | yes | yes | Stop splitting once roughly `n` subtrees are scheduled |
| `--max-jobs-total <n>` | yes | yes | Cap total enqueued jobs |
| `--file-batch <n>` | yes | yes | Files per file-batch job; used when file jobs are enabled |
| `--no-file-jobs` | yes | yes | Disable file-batch jobs |
| `--file-jobs` | yes | yes | Enable file-batch jobs |
| `--parallel-files` | no effect | yes | Parallelize file-list mode when jobs resolve above `1` |
| `--no-parallel` | yes | yes | Same as `--jobs 1` |

## File handling and output

| Flag | Applies in search mode | Applies in `--files` mode | Meaning |
| --- | --- | --- | --- |
| `--text` | yes | parsed but has no effect | Search files that look binary |
| `-l`, `--files-with-matches` | yes | parsed but has no effect | Print only matching file paths |
| `--heading` | yes | parsed but has no effect | Print a file header before matches |
| `-n`, `--line-number` | yes | parsed but has no effect | Show line numbers; default on |
| `--no-line-number` | yes | parsed but has no effect | Suppress line numbers |
| `--no-numbers` | yes | parsed but has no effect | Alias for `--no-line-number` |
| `--column` | yes | parsed but has no effect | Show the 1-based byte column; requires line numbers |
| `--stats` | yes | yes | Print summary stats to stderr |
| `-q`, `--quiet` | yes | parsed but has no effect | Print the first matching line and exit early |
| `--files` | switches mode | n/a | List searchable files instead of searching content |

## Color and meta

| Flag | Applies in search mode | Applies in `--files` mode | Meaning |
| --- | --- | --- | --- |
| `--color <mode>` | yes | yes | `auto`, `always`, or `never` |
| `--no-color` | yes | yes | Same as `--color never` |
| `-h`, `--help` | yes | yes | Print help and exit |
| `-V`, `--version` | yes | yes | Print version and exit |

## Flag syntax rules

- long value-taking flags accept `--flag value` and `--flag=value`
- short value-taking flags use a separate argument
- concurrency knobs accept `auto` case-insensitively
- `--color` accepts only lowercase `auto|always|never`
- `--max-count auto` is accepted, but `--max-count=auto` is not
- `--max-depth -1` is accepted and behaves like unlimited depth

## Mode notes

Search-only flags are still parsed in `--files` mode, but many of them have no effect because listing prints only path output.

That means commands like this parse successfully:

```bash
slg --files -F TODO src
```

but only the traversal/listing behavior matters.
