# Search recipes

These are practical `slg` workflows for code trees, logs, and large repositories.

## Search a tree with regex

```bash
slg "TODO|FIXME" src
```

This is the default mode. The first positional is the pattern; later positionals are roots.

## Search a tree with literal text

```bash
slg -F "TODO:" .
slg -Q "TODO:" .
```

Use `-F` / `-Q` when you want byte-substring matching instead of regex syntax.

## Lean on automatic fixed matching

```bash
slg TODO src
```

When the pattern has no regex metacharacters, `slg` automatically uses the fixed matcher. This is the current implementation behavior even without `-F`.

## Case-insensitive search

```bash
slg -i "error" logs
slg -S "todo" src
```

- `-i` always requests case-insensitive matching
- `-S` turns on ignore-case only when the pattern has no ASCII uppercase letters

## Show only matching file paths

```bash
slg -l "TODO" .
```

This is the grep-style “files with matches” path.

## Print headings instead of repeating paths

```bash
slg --heading "TODO" src
```

This prints a file header once, then match lines underneath it.

## List searchable files without searching content

```bash
slg --files src
slg src --files --max-depth 0
```

`--files` is useful when you want to inspect the traversal result, debug ignore behavior, or hand the file list to another tool.

## Search hidden content and VCS trees

```bash
slg --hidden --no-ignore-vcs "version" .
```

`--no-ignore-vcs` alone is not enough to walk `.git`, `.hg`, or `.svn`, because those directories are still hidden unless `--hidden` is also set.

## Disable ignore rules completely

```bash
slg --no-ignore "needle" .
```

This re-enables hidden/common/VCS paths and ignore-file matches as search candidates, except that hidden entries still require `--hidden` to be traversed.

## Search binary-looking files anyway

```bash
slg --text -F "PK\x03\x04" artifacts
```

By default, `slg` skips files that contain a NUL byte in the first 1024 bytes.

## Stop after the first useful result

```bash
slg -q "panic" logs
```

`--quiet` is an early-exit mode, not a silent mode. It prints the first matching line or path, flushes output, then stops.

## Tune parallel traversal

```bash
slg --jobs auto "TODO" .
slg --jobs auto --file-batch 128 "TODO" .
slg --files --parallel-files --jobs 8 .
```

- Search mode uses parallel traversal when `--jobs` resolves above `1`
- `--files` needs `--parallel-files` before it parallelizes listing

## Search for values that begin with `-`

```bash
slg -F -- --no-ignore-files .
slg -- --path-like-value
```

Use `--` to stop flag parsing.

## Print columns and stats

```bash
slg --column --stats "TODO" src
```

`--column` adds a 1-based byte column to each match line. `--stats` prints the summary to stderr.
