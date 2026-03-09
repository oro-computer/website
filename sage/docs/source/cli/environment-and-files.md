# Environment and files

This page collects every environment variable and important filesystem location used by `sage`.

## Environment variables

### Core CLI

| Variable | Meaning |
| --- | --- |
| `SAGERC` | Path to a `.sagerc` file |
| `NO_COLOR` | Disables UI colors when `color = "auto"` |
| `XDG_CONFIG_HOME` | Base config directory |
| `XDG_CACHE_HOME` | Base cache directory |
| `SAGE_SYNTAX_CACHE_DIR` | Overrides syntax cache lookup |

### Plugin loading and logging

| Variable | Meaning |
| --- | --- |
| `SAGE_NO_PLUGINS` | Disables plugin loading |
| `SAGE_PLUGINS_DIR` | Overrides the plugins directory |
| `SAGE_PLUGIN_LOG` | Overrides the plugin log path |
| `SAGE_PLUGIN_LOG_STDERR` | Sends plugin logs to `stderr`; debug-only because it can corrupt the TUI |
| `SAGE_CONSOLE_LEVEL` | Console threshold for plugin logging |

### Plugin limits

| Variable | Meaning |
| --- | --- |
| `SAGE_PLUGIN_LOAD_TIMEOUT_MS` | Plugin bootstrap/load budget |
| `SAGE_PLUGIN_EVENT_TIMEOUT_MS` | Per-event budget |
| `SAGE_PLUGIN_MEM_LIMIT_MB` | QuickJS memory limit |
| `SAGE_PLUGIN_STACK_LIMIT_KB` | QuickJS stack limit |

### HTTPS and fetch

| Variable | Meaning |
| --- | --- |
| `SSL_CERT_FILE` | PEM CA bundle used for HTTPS fetch |
| `SAGE_FETCH_INSECURE` | Non-zero disables HTTPS certificate verification |

## Default files and directories

| Path | Purpose |
| --- | --- |
| `~/.config/sage/syntax/` | Default syntax source directory |
| `~/.cache/sage/syntax/` | Default compiled syntax cache directory |
| `~/.config/sage/plugins/` | Default plugin directory |
| `~/.cache/sage/plugins.log` | Default plugin log file |
| `./.sagerc` | Project-local config |
| `~/.sagerc` | Fallback user config |

Plugin state lives under:

```text
~/.local/state/sage/plugins/
```

`XDG_STATE_HOME` overrides that base when set.

Each plugin receives its own data directory derived from the plugin filename.

If the state directory cannot be resolved, the host falls back to a temporary directory under `/tmp/sage/plugins`.

## Find tool defaults

Unless `find_cmd` is configured, `sage` chooses the first available tool:

1. `rg --vimgrep -- <query> <...files>`
2. `ag --vimgrep -- <query> <...files>`
3. `slg -- <query> <...files>`
4. `grep -inH -- <query> <...files>`

The parser accepts both:

- vimgrep-style `path:line:col:text`
- grep-style `path:line:text`

## Distribution layout

The `build/` directory is intended to be distributable.

Typical install flow:

```bash
make -C build install PREFIX=/usr/local
```

Expected layouts:

- build layout: `<root>/bin/sage`, `<root>/syntax/`
- installed layout: `<prefix>/bin/sage`, `<prefix>/share/sage/syntax/`
