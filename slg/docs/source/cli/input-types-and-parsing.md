# Input types and parsing

This page is the exact downstream input model for `slg`.

## Search mode positionals

Search mode is:

```text
slg [options] <pattern> [path ...]
```

Rules:

- the **first** positional argument is the pattern
- every later positional argument is a root path
- if no root paths are provided, `slg` uses `.`

Examples:

```bash
slg TODO
slg TODO src
slg TODO src tests
slg src TODO --hidden
```

Because options may appear before or after positionals, all four shapes are valid as long as search mode still has a first positional pattern.

## File-list mode positionals

File-list mode is:

```text
slg --files [options] [path ...]
```

Rules:

- every positional argument is a root path
- if no root paths are provided, `slg` uses `.`

Examples:

```bash
slg --files
slg --files src
slg src --files --max-depth 0
```

## End of option parsing

Use `--` when a pattern or path begins with `-`:

```bash
slg -F -- --no-ignore-files .
slg -- --path-that-starts-with-a-dash
```

Everything after `--` is positional.

## Supported root types

### Regular files

If a root is a file, `slg` searches or lists that file directly.

```bash
slg TODO README.md
slg --files README.md
```

### Directories

If a root is a directory, `slg` walks it recursively.

```bash
slg TODO src
slg --files src
```

### Symlinks

Symlinks are not followed unless `--follow` is set.

```bash
slg --follow TODO linked-tree
```

Following symlinks may loop when the directory graph loops.

### Hidden entries

Hidden files and directories are skipped unless `--hidden` is set.

```bash
slg --hidden TODO .
slg --files --hidden .
```

## Unsupported input types

`slg` does **not** currently have:

- stdin mode
- URL mode
- socket/stream input mode
- shell-style glob expansion for root arguments

Important consequences:

- `slg -` treats `-` as a literal pattern or path, depending on position
- quoting a glob preserves it as a literal positional value unless your shell expands it first
- only ignore files provide glob syntax, and only inside ignore rules

## No stdin shorthand

There is no `grep`-style stdin special case.

These are **not** equivalent:

```bash
printf 'TODO\n' | slg TODO
slg TODO -
```

The first form pipes bytes to `slg`, but `slg` has no stdin search path and will still parse only filesystem roots. The second form treats `-` as a literal root path named `-`.

## Value flags after positionals

Value-taking options can appear after roots:

```bash
slg src --files --max-depth 0
slg -F TODO src --jobs 8
```

This is part of the parser’s public behavior.

## No runtime config layer

`slg` does not load a config file or environment-based runtime profile. Use CLI flags for behavior changes.
