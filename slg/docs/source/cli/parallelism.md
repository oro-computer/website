# Parallelism

`slg` can traverse and search in parallel, but the control surface is explicit and intentionally bounded.

## The core knob: `--jobs`

```bash
slg --jobs auto TODO .
slg --jobs 1 TODO .
slg --jobs 8 TODO .
```

Rules:

- `0` or `auto` means automatic sizing
- `1` forces single-threaded mode
- values above `1` enable task-based parallel traversal/search

Automatic sizing is capped to keep scheduler overhead bounded: search mode uses at most `8` jobs, while `--files --parallel-files` uses at most `9` jobs. Explicit `--jobs N` values can go higher, up to the hard clamp.

`--threads` is an alias for `--jobs`.

`--no-parallel` is the same as `--jobs 1`.

## Search mode vs `--files`

Search mode parallelizes when jobs resolve above `1`.

`--files` mode only parallelizes listing when `--parallel-files` is also set:

```bash
slg --files --parallel-files --jobs 8 .
```

Without `--parallel-files`, file-list mode stays effectively serial.

## Worker and scheduler controls

### `--max-workers`

Cap worker tasks:

```bash
slg --jobs auto --max-workers 4 TODO .
```

`0` means “no explicit cap”.

### `--split-depth`

Control how deep directory subtrees are split into parallel jobs:

```bash
slg --jobs auto --split-depth 2 TODO .
```

`0` or `auto` means automatic sizing.

### `--queue-cap`

Bound the job queue:

```bash
slg --jobs auto --queue-cap 512 TODO .
```

### `--target-jobs`

Stop splitting once roughly `N` subtrees have been scheduled:

```bash
slg --jobs auto --target-jobs 256 TODO .
```

### `--max-jobs-total`

Cap total enqueued jobs across the run:

```bash
slg --jobs auto --max-jobs-total 4096 TODO .
```

### `--file-jobs` and `--file-batch`

Parallelize inside flat, file-heavy directories by batching files into jobs. File-batch jobs are off by default; enable them explicitly:

```bash
slg --jobs auto --file-jobs --file-batch 128 TODO .
```

Use `--no-file-jobs` to force this path off again. When `--file-batch` is `0` or `auto`, the current default batch size is `512`.

## Flag syntax rules

Concurrency flags accept:

- `--flag value`
- `--flag=value`
- `auto` in any ASCII case for the knobs that support it

Examples:

```bash
slg --jobs=auto TODO .
slg --queue-cap AUTO TODO .
slg --split-depth=2 TODO .
```

## Current bounds and clamps

The current implementation clamps large values to keep the parallel engine bounded.

| Flag | Auto value accepted | Current clamp |
| --- | --- | --- |
| `--jobs`, `--threads` | yes | `1024` |
| `--max-workers` | no | `1023` |
| `--split-depth` | yes | `8` |
| `--queue-cap` | yes | `8` minimum, `65536` maximum |
| `--target-jobs` | yes | `1048576` |
| `--max-jobs-total` | yes | `1048576` |
| `--file-batch` | yes | `4096` |

These are public enough to document because they affect operator expectations.

## Practical advice

- Start with `--jobs auto`
- Add `--stats` before tuning anything
- Reach for `--file-jobs --file-batch` in flat directories with many files
- Reach for `--split-depth` when the tree is very branchy
- Use `--jobs 1` to reproduce a result without parallel scheduling

## Examples

Single-threaded for debugging:

```bash
slg --jobs 1 TODO .
```

Auto-parallel search:

```bash
slg --jobs auto TODO .
```

Parallel listing:

```bash
slg --files --parallel-files --jobs 8 .
```

Flat-directory tuning:

```bash
slg --jobs auto --file-jobs --file-batch 64 --queue-cap 256 TODO build
```
