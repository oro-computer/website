# Configuration

`sage` reads configuration from `.sagerc`, a TOML file.

## Load order

If `--rc PATH` is provided, `sage` reads that file.

Otherwise it checks:

1. `SAGERC`
2. `./.sagerc`
3. `$HOME/.sagerc`

Command-line flags override configuration values.

## Failure behavior

- invalid `.sagerc` TOML is a warning on `stderr`
- the pager continues running with defaults and whatever valid keys were already applied
- an explicit unreadable `--rc PATH` is treated more strictly than `SAGERC`

## Example `.sagerc`

```toml
theme = "ocean"
color = "auto"
alt_screen = true
mouse = true

ansi = true
syntax = true
gutter = "auto"

regex = false
ignore_case = false

plugins = true
plugin_load_timeout_ms = 500
plugin_event_timeout_ms = 50
plugin_mem_limit_mb = 64
plugin_stack_limit_kb = 1024

[syntax_map]
"Makefile" = "make"
"*.service" = "ini"
"sagerc" = "toml"
```

## Core keys

### UI

- `theme` — `"default"`, `"ocean"`, `"light"`
- `color` — `"auto"`, `"always"`, `"never"`
- `alt_screen` / `alt-screen` — boolean
- `no_alt_screen` / `no-alt-screen` — boolean
- `mouse` — boolean
- `gutter`, `line_numbers`, `line-numbers` — `"auto"`, `"always"`, `"never"`, or boolean

Boolean gutter values map to:

- `true` → `"always"`
- `false` → `"never"`

### Content handling

- `ansi` — boolean
- `syntax` — boolean
- `raw`, `unsafe_raw` — boolean
- `binary`, `allow_binary` — boolean

### Search

- `regex` — boolean
- `ignore_case`, `ignore-case` — boolean
- `find`, `find_cmd`, `find-cmd` — string or array

`find_cmd` details:

- string form is whitespace-split, not shell-parsed
- array form preserves each argument exactly

Examples:

```toml
find_cmd = "rg --vimgrep --"
```

```toml
find_cmd = ["rg", "--vimgrep", "--"]
```

### Plugins

- `plugins` — boolean
- `no_plugins`, `no-plugins` — boolean
- `plugins_dir`, `plugins-dir` — absolute path
- `plugin_log`, `plugin-log`, `plugin_log_path`, `plugin-log-path` — absolute path
- `plugin_load_timeout_ms`, `plugin-load-timeout-ms` — integer milliseconds
- `plugin_event_timeout_ms`, `plugin-event-timeout-ms` — integer milliseconds
- `plugin_mem_limit_mb`, `plugin-mem-limit-mb` — integer mebibytes
- `plugin_stack_limit_kb`, `plugin-stack-limit-kb` — integer kibibytes

### Palette overrides

These keys accept numbers in `0..255`:

- `status_bg`
- `status_fg`
- `status_dim`
- `brand`
- `accent`
- `warn`
- `err`
- `mode_regex`
- `match_bg`
- `match_fg`

Syntax palette overrides:

- `syn_comment`
- `syn_string`
- `syn_number`
- `syn_keyword`
- `syn_type`
- `syn_function`
- `syn_constant`
- `syn_operator`
- `syn_heading`
- `syn_emphasis`
- `syn_preproc`

## `syntax_map`

`syntax_map` maps names or patterns to syntax keys.

Matching rules:

- exact basename, for example `"Makefile"`
- exact extension, for example `"toml"` or `"rs"`
- glob patterns with `*` and `?`
- globs match the basename unless the pattern contains `/`

Examples:

```toml
[syntax_map]
"Makefile" = "make"
"*.bashrc" = "bash"
"*.service" = "ini"
"sagerc" = "toml"
```

## Precedence summary

From highest to lowest:

1. command-line flags
2. `--rc PATH`
3. `SAGERC`
4. `./.sagerc`
5. `$HOME/.sagerc`
6. built-in defaults

