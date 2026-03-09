# Diagnostics

This page documents the public exit codes plus the most important user-visible warnings and errors.

## Exit status

- `0` — success
- `2` — error

## Common messages

### `sage: cannot combine '-' with multiple files`

Cause:

- `-` represents stdin, and stdin is single-use

Fix:

- run `sage -` by itself
- or replace `-` with real file paths

### `sage: failed to open input`

Cause:

- the input path could not be opened
- the URL fetch failed
- stdin spooling failed

Fix:

- check the path or URL
- confirm permissions
- for URLs, verify network reachability and scheme support

### `sage: invalid config TOML (...)`

Cause:

- `.sagerc` could not be parsed as TOML

Behavior:

- this is a warning on `stderr`
- `sage` continues running

Fix:

- validate the TOML
- compare against [Configuration](?p=cli/configuration)

### Syntax cache failures

Examples:

- `sage: no compiled syntax index found (run --compile-cache)`
- `sage: unsupported syntax index version`
- `sage: XDG config dir unavailable`
- `sage: XDG cache dir unavailable`

Fix:

```bash
sage --compile-cache
```

If the XDG directories are overridden, verify the environment values.

## Security-related behavior

### `--raw`

`--raw` is unsafe:

- it renders bytes as-is
- untrusted input may execute terminal control sequences

Use it only for trusted inputs.

### `--no-ansi`

`--no-ansi` fully sanitizes escape sequences from content. This is the safer choice for untrusted piped content.

### Current pass-through branch

When `stdout` is not a TTY, `sage` enters a streaming branch instead of the TUI. Current behavior to understand:

- it does not load plugins
- it does not apply the full interactive safety path
- it does not expand directories
- it does not handle network URLs

Treat non-TTY stdout as a separate operational mode.

## Troubleshooting checklist

1. Re-run with `--verbose`.
2. Disable plugins with `--no-plugins`.
3. Disable mouse with `--no-mouse`.
4. Disable alternate screen with `--no-alt-screen`.
5. Disable ANSI passthrough with `--no-ansi`.
6. Rebuild the syntax cache with `--compile-cache`.
7. If plugins are involved, inspect `SAGE_PLUGIN_LOG`.

