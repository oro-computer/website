# Diagnostics

This page documents the public exit codes plus the most important user-visible diagnostics.

## Exit status

| Code | Meaning |
| --- | --- |
| `0` | Match found, or `--files` completed successfully. |
| `1` | No matches found. |
| `2` | Parse error, pattern error, runtime error, or output failure. |

## Parse-time diagnostics

### Missing pattern

Example:

```text
slg: missing <pattern>. Try: slg --help
```

Cause:

- search mode was selected
- no positional pattern was provided

### Unknown flag

Example:

```text
slg: unknown flag: --wat. Try: slg --help
```

Cause:

- the parser does not recognize the flag

### Missing value for a flag

Example:

```text
slg: missing value for --jobs
```

Cause:

- a value-taking flag was passed without a following value

### Invalid value for a flag

Examples:

```text
slg: invalid value for --jobs: expected integer or auto
slg: invalid value for --max-workers: expected integer
slg: invalid value for --color: expected auto|always|never
```

Cause:

- the value did not match the accepted parser shape for that flag

### `--column` without line numbers

Example:

```text
slg: --column requires line numbers (remove --no-line-number)
```

Cause:

- `--column` was combined with `--no-line-number` / `--no-numbers`

## Pattern diagnostics

### Invalid regex pattern

Example:

```text
slg: invalid pattern (regex compile failed)
```

Cause:

- regex compilation failed

### Invalid pattern

Example:

```text
slg: invalid pattern
```

Cause:

- the pattern was empty or otherwise invalid for the matcher

## Runtime I/O diagnostics

These are reported on stderr and generally return exit status `2`.

### Failed to open a file

Example shape:

```text
path/to/file: failed to open
```

Typical causes:

- the file does not exist
- permissions do not allow reading it

### Failed to open a directory

Example shape:

```text
path/to/dir: failed to open directory
```

Typical causes:

- the directory does not exist
- permissions block traversal

### Failed to read

Example shape:

```text
path/to/file: failed to read
```

Typical causes:

- short-lived I/O failure while reading file bytes

### Failed to read file size

Example shape:

```text
path/to/file: failed to read file size
```

### Failed to mmap

Example shape:

```text
path/to/file: failed to mmap
```

Large files currently use an `mmap` path after a small prefix probe.

### Out of memory

Example shape:

```text
path/to/tree: out of memory
```

This can come from traversal state, ignore-file parsing, or output buffering.

## Output failure

If stdout is not writable, `slg` treats that as an error and exits `2`.

This matters in pipelines, redirections, and broken pipes.

## Stats and error counts

When `--stats` is enabled, the stderr summary includes an `errors=` field.

That count tracks runtime/search/output issues observed during the run.

## Troubleshooting checklist

1. Re-run with a smaller root set to isolate the failing path.
2. Use `--files` to inspect traversal separately from matching.
3. Add `--hidden` when you expect dot-prefixed paths.
4. Add `--hidden --no-ignore-vcs` when you expect `.git`, `.hg`, or `.svn`.
5. Add `--no-ignore-files` when ignore rules may be hiding the target path.
6. Add `--text` when the file looks binary.
7. Use `--jobs 1` to remove parallel scheduling from the problem.
