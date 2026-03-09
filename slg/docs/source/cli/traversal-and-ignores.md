# Traversal and ignores

This page documents exactly what `slg` walks, skips, and re-enables.

## Traversal flags

### `--hidden`

Include hidden files and directories:

```bash
slg --hidden TODO .
```

Without this flag, dot-prefixed names are skipped.

### `--follow`

Follow symlinks:

```bash
slg --follow TODO linked-tree
```

This may loop if the directory graph loops.

### `--max-depth`

Limit recursion depth:

```bash
slg --max-depth 0 TODO src
slg --files --max-depth 2 src
```

Rules:

- `0` means “only the root itself”
- positive values allow deeper recursion
- negative values are currently accepted and behave like “unlimited”

For downstream use, prefer explicit non-negative values.

## Default ignore behavior

By default, `slg` enables all three ignore sources:

- **common heavy directories** — `node_modules`, `build`, `dist`, `target`, `tmp`, `.cache`
- **VCS directories** — `.git`, `.hg`, `.svn`
- **per-directory ignore files** — `.gitignore`, `.ignore`, `.agignore`

## Master toggles

Disable all ignore sources:

```bash
slg --no-ignore TODO .
```

Re-enable all ignore sources:

```bash
slg --ignore TODO .
```

## Individual ignore toggles

Enable:

- `--ignore-common`
- `--ignore-vcs`
- `--ignore-files`

Disable:

- `--no-ignore-common`
- `--no-ignore-vcs`
- `--no-ignore-files`

## VCS directories and `--hidden`

This is a common source of confusion:

```bash
slg --no-ignore-vcs TODO .
```

does **not** imply:

```bash
slg --hidden --no-ignore-vcs TODO .
```

VCS directories are still hidden directories, so you need `--hidden` as well if you want to walk them.

## Ignore file syntax

The supported ignore-file subset is pragmatic rather than full gitignore semantics.

Supported:

- `.gitignore`, `.ignore`, `.agignore`
- blank lines and `#` comments
- `!` negation
- trailing `/` for directory-only rules
- leading `/` anchoring for name-only patterns
- `*` and `?`
- `**` as a full path segment

Examples:

```text
# ignore log files
*.log

# keep one specific file
!keep.log

# ignore a directory
build/

# root-only name match
/anchored.txt
```

Not currently supported:

- backslash escaping
- character classes like `[a-z]`
- git’s full “re-include requires parent directories to be unignored” rule

## Search mode and `--files` mode share traversal

The same traversal and ignore logic is used for:

- search mode
- `--files` mode

The difference is only what gets printed.

## Typical recipes

Search everything except default ignored paths:

```bash
slg TODO .
```

Search hidden files too:

```bash
slg --hidden TODO .
```

Search even VCS directories:

```bash
slg --hidden --no-ignore-vcs TODO .
```

Ignore no ignore files:

```bash
slg --no-ignore-files TODO .
```

Ignore nothing:

```bash
slg --hidden --no-ignore TODO .
```
