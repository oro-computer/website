# Output and exit codes

This page documents what `slg` prints, where it prints it, and how it exits.

## Stdout vs stderr

- match results go to **stdout**
- file-list output from `--files` goes to **stdout**
- stats from `--stats` go to **stderr**
- diagnostics go to **stderr**

## Default match format

Default search output is path + line number + line text:

```text
path:line:text
```

Example:

```text
src/main.slk:42:return 0;
```

Line numbers are 1-based and enabled by default.

## Column format

Use `--column` to add the match column:

```bash
slg --column TODO src
```

Output shape:

```text
path:line:column:text
```

The column is a 1-based byte offset.

`--column` requires line numbers, so this is invalid:

```bash
slg --column --no-line-number TODO src
```

## File header mode

Use `--heading` to print a file header once and then emit match lines without the repeated path prefix:

```bash
slg --heading TODO src
```

This is useful when many matches come from the same file.

## File-only outputs

### `-l`, `--files-with-matches`

Print only matching file paths:

```bash
slg -l TODO src
```

### `--files`

List files that would be searched:

```bash
slg --files src
```

This mode never searches file contents.

## `--quiet`

`--quiet` is an early-exit mode, not a silent mode.

Behavior:

- print the first matching line or path
- flush output
- stop immediately

Example:

```bash
slg -q TODO src
```

## Stats summary

Use `--stats` to print a summary to stderr:

```bash
slg --stats TODO src
```

Current fields:

- `files_searched`
- `files_matched`
- `match_lines`
- `errors`
- `time_ms`

Example shape:

```text
slg stats: files_searched=128 files_matched=9 match_lines=14 errors=0 time_ms=23
```

## Color

Color is controlled by:

- `--color auto|always|never`
- `--no-color`
- `NO_COLOR`

Rules:

- `always` always emits ANSI colors
- `never` never emits ANSI colors
- `auto` enables color only when the target fd is a TTY and `NO_COLOR` is not set

## Exit status

### `0`

- at least one match was found
- or `--files` completed successfully

### `1`

- no matches were found

### `2`

- CLI parse error
- invalid pattern
- runtime I/O failure
- output failure

## Examples

Search with plain output:

```bash
slg TODO src
```

Search with columns and stats:

```bash
slg --column --stats TODO src
```

List only matching files:

```bash
slg -l TODO src
```
