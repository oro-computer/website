# Keys and commands

This is the full interactive key and command reference for `sage`.

## Navigation

| Key | Action |
| --- | --- |
| `q` | Quit |
| `Ctrl-C` | Quit, or copy the active selection when one exists |
| `j`, `d`, `Down` | Scroll down one visual line |
| `k`, `u`, `Up` | Scroll up one visual line |
| `Space`, `PageDown`, `Ctrl-D` | Page down |
| `b`, `PageUp`, `Ctrl-U` | Page up |
| `Right`, `Left` | Page forward / back |
| `gg`, `Home` | Jump to top |
| `G`, `End` | Jump to bottom |

## Tabs

| Key | Action |
| --- | --- |
| `Tab` | Next tab |
| `Shift-Tab` | Previous tab |
| `0`-`9` | Jump to tab number; `0` selects the last tab |
| mouse click on a tab | Activate that tab |

Tabs are 1-indexed.

## Search

| Key | Action |
| --- | --- |
| `/`, `Ctrl-F` | Start incremental search in the active tab |
| `n` | Next match |
| `p` | Previous match |
| `Esc` | Cancel the in-flight search and clear selection state |
| double-click | Set the search query to the clicked word |

Search defaults are controlled by:

- `-R`, `--regex`
- `-i`, `--ignore-case`
- `.sagerc` `regex`
- `.sagerc` `ignore_case`

## Find across tabs

`Ctrl-K` opens the find modal and searches across the currently open tabs.

Inside the modal:

- `Up` / `Down` — move through results
- `Tab` / `Shift-Tab` — move focus
- `Enter` or click — jump to the selected result
- mouse wheel — scroll results
- `Esc` — close the modal

For local files, `sage` shells out to the configured or default external find tool. For URL-backed tabs, the content is resolved through the URL handling path.

See [Syntax and cache](?p=cli/syntax-and-cache) and [Environment and files](?p=cli/environment-and-files) for `find_cmd`.

## Help and view toggles

| Key | Action |
| --- | --- |
| `L` | Toggle the line-number gutter |
| `?`, `h` | Toggle the help overlay |

## Selection

With mouse support enabled:

- left-drag selects text in the content area
- the gutter is excluded from selection
- `Ctrl-C` copies the active selection via OSC 52
- `Esc` clears the selection

Some terminals and muxers use `Shift` to bypass application mouse reporting for terminal-native selection.

## Command mode

Press `:` to enter command mode.

### Built-in commands

| Command | Action |
| --- | --- |
| `:q`, `:quit` | Quit |
| `:N` | Jump to line `N` |
| `:0` | Jump to line 1 |
| `:-N` | Count backward from the end |
| `:bn`, `:buffer-next`, `:tn`, `:tab-next` | Next tab |
| `:bp`, `:buffer-prev`, `:buffer-previous`, `:tp`, `:tab-prev`, `:tab-previous` | Previous tab |
| `:tab N` | Jump to tab `N` |
| `:tN`, `:t N` | Alias for `:tab N` |
| `:set syntax=KEY` | Override syntax for the current tab |
| `:set syntax=` | Clear the override |
| `:set syntax=auto` | Clear the override |

### Notes

- built-in commands are handled before plugin commands
- plugin command names are normalized to trimmed lowercase
- unknown commands are offered to every loaded plugin in order
- duplicate plugin command names all run

