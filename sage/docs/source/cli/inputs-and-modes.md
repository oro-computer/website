# Inputs and modes

This page is the exact downstream input model for `sage`.

## Accepted input types

### Local file paths

```bash
sage README.md
sage /var/log/system.log
```

### Directories

```bash
sage src/
```

Directory behavior:

- expansion is non-recursive
- every direct child file becomes a tab
- direct child directories are skipped
- if a directory has no direct child files, the original path is kept so the open failure is visible

### Stdin

Implicit stdin:

```bash
git diff | sage
```

Explicit stdin:

```bash
sage -
```

Important stdin caveats:

- `sage` with no paths and interactive stdin prints help instead of blocking
- `sage -` with interactive stdin also prints help instead of blocking
- `-` cannot be combined with other inputs

### Network URLs

HTTP(S):

```bash
sage https://example.com/
```

SSH:

```bash
sage ssh://user@example.com/etc/hosts
```

Remote inputs are read-only.

## Interactive mode vs pass-through mode

### Interactive mode

If `stdout` is a TTY, `sage` starts the TUI.

This includes:

- interactive navigation
- tabs
- search and find
- syntax highlighting
- plugins
- mouse interaction

When stdin is piped and stdout is still a TTY, `sage` reads keys from `/dev/tty` so the session stays interactive.

### Pass-through mode

If `stdout` is not a TTY, `sage` does not enter the TUI.

Examples:

```bash
sage README.md > /tmp/out
cat README.md | sage > /tmp/out
```

Current pass-through behavior:

- it streams stdin if the path is `-`
- otherwise it streams the first positional path only
- it does not enter the pager
- it does not expand directories
- it does not resolve network URLs
- it does not load plugins

That means pass-through mode is a different code path from the TUI.

## Syntax selection for each input kind

### Local paths

Syntax selection uses:

1. `:set syntax=...` overrides
2. `.sagerc` `syntax_map`
3. compiled syntax index matches

### URLs

For URLs, `sage` ignores query strings and fragments for syntax selection.

Example:

```text
https://example.com/api/data.json?pretty=1#section
```

The `.json` path still participates in syntax selection.

If the URL path has no useful extension, `sage` may use the HTTP `Content-Type` as a hint. The built-in content-type mapping includes:

- `json`
- `html`
- `css`
- `js`
- `ts`
- `xml`
- `md`
- `yaml`
- `csv`

### Stdin

Stdin does not get syntax highlighting automatically. Use a per-tab override:

```text
:set syntax=diff
:set syntax=json
:set syntax=auto
```

## End-of-options marker

`--` ends option parsing. Everything after it is treated as a path.

This matters when a path begins with `-`:

```bash
sage -- --literal-file-named-like-a-flag
```

