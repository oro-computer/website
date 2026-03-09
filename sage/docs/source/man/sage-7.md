# `sage(7)`

`sage(7)` is the conceptual manual page for the pager. It explains how the CLI behaves beyond the flag list in `sage(1)`.

## What `sage(7)` defines

### Inputs

`sage(7)` defines the supported input kinds:

- local file paths
- directories, expanded non-recursively
- stdin
- `http://`, `https://`, and `ssh://` URLs

It also calls out URL-specific syntax selection behavior.

Read the fuller website breakdown in [Inputs and modes](?p=cli/inputs-and-modes).

### Tabs, search, and find

`sage(7)` is the reference for:

- how tabs behave
- the difference between search and find
- the external find tool fallback order
- how result parsing works for vimgrep-style and grep-style tools

Read the fuller website breakdown in [Keys and commands](?p=cli/keys-and-commands) and [Environment and files](?p=cli/environment-and-files).

### Syntax selection and cache layout

`sage(7)` defines:

- syntax selection order
- `syntax_map`
- cache and source directories
- bundled-cache layouts for build and installed trees

Read the fuller website breakdown in [Syntax and cache](?p=cli/syntax-and-cache).

### Plugins, security, and distribution

`sage(7)` also introduces:

- plugin support at a conceptual level
- security notes for sanitization and `--raw`
- the intended distributable `build/` layout

The fuller website references are:

- [Plugins quickstart](?p=guides/plugins-quickstart)
- [JavaScript runtime](?p=javascript/runtime)
- [Diagnostics](?p=cli/diagnostics)

## Best companion pages

- [Inputs and modes](?p=cli/inputs-and-modes)
- [Syntax and cache](?p=cli/syntax-and-cache)
- [Configuration](?p=cli/configuration)
- [Environment and files](?p=cli/environment-and-files)
- [Plugins quickstart](?p=guides/plugins-quickstart)

## Upstream source

- [`man/sage.7`](https://github.com/oro-computer/sage/blob/master/man/sage.7)
