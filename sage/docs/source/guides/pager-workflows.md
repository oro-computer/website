# Pager workflows

`sage` is most useful when you treat it as a CLI tool first and a programmable runtime second. These patterns cover the common downstream workflows.

## Use it as your pager

For `man`:

```bash
PAGER=sage man printf
```

For `git`:

```bash
git -c core.pager=sage log -p
git diff | sage
```

For build logs:

```bash
make 2>&1 | sage
```

When stdin is piped and stdout is still a TTY, `sage` keeps the interactive TUI and reads keys from `/dev/tty`.

## Browse a source tree

Open one directory as tabs:

```bash
sage src/
```

Notes:

- directory expansion is non-recursive
- only direct child files become tabs
- subdirectories are skipped

If you need a narrower set, hand the file list to `sage` explicitly:

```bash
sage src/main.js src/router.js src/theme.css
```

## Inspect URLs from the terminal

HTTP(S):

```bash
sage https://example.com/
sage https://api.github.com/repos/oro-computer/sage
```

SSH:

```bash
sage ssh://user@example.com/etc/hosts
```

Remote inputs are read-only. Syntax selection may come from the URL path or, when needed, an HTTP `Content-Type` hint.

## Use pass-through mode intentionally

When `stdout` is not a TTY, `sage` does not enter the TUI. It falls back to a streaming branch.

Examples:

```bash
sage README.md > /tmp/readme.copy
cat README.md | sage > /tmp/readme.copy
```

Current behavior to understand:

- the pass-through branch streams bytes directly
- it does not enter the pager UI
- it does not load plugins
- it does not expand directories or resolve network URLs

See [Inputs and modes](?p=cli/inputs-and-modes) for the exact rules.

## Adopt command mode

Useful command-mode examples:

```text
:42        jump to line 42
:-2        jump near the end of the file
:bn        next tab
:bp        previous tab
:tab 3     jump to tab 3
:set syntax=toml
:set syntax=auto
```

Command mode is the fastest way to move around once the TUI is open.

