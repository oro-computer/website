# JavaScript runtime

This page describes the full plugin runtime model: how plugins load, what globals are installed, what events exist, and where the limits are.

## Loading model

Plugins are:

- loaded only in the interactive TUI path
- discovered from `*.js` files in lexicographic order
- evaluated as ES modules
- each run in their own QuickJS runtime/context

Plugin directory resolution:

1. `--plugins-dir PATH` or `.sagerc` `plugins_dir`, unless `SAGE_PLUGINS_DIR` is set
2. `SAGE_PLUGINS_DIR`
3. `XDG_CONFIG_HOME/sage/plugins`
4. `$HOME/.config/sage/plugins`

Disable plugins with:

- `--no-plugins`
- `SAGE_NO_PLUGINS=1`
- `.sagerc` `plugins = false`

## Import rules

- `import ... from 'sage:...'` works for built-in modules
- relative imports are allowed only for filesystem modules within the plugin’s real path tree
- bare imports are rejected
- relative imports from `sage:*` modules are rejected
- top-level `await` is not supported and disables the plugin at load time

## Globals

### Runtime detection

- `isSageRuntime === true`

### Event system

- `EventTarget`
- `Event`
- `CustomEvent`
- `MessageEvent`
- `addEventListener(type, fn)`
- `removeEventListener(type, fn)`
- `dispatchEvent(ev)`
- `on(type, fn)`
- `once(type, fn)`
- `off(type, fn)`

`addEventListener` receives an event object. `on` and `once` receive the payload directly.

### Logging

- `console.log`
- `console.info`
- `console.warn`
- `console.error`
- `console.verbose`
- `console.debug`

Logging is filtered by `SAGE_CONSOLE_LEVEL`:

- `silent`, `none`, `off`
- `error`
- `warn`
- `info`, `log`
- `verbose`
- `debug`
- numeric levels `-1..4`

Default threshold:

- `warn`
- `debug` when `sage` runs with `--verbose`

### Timers

- `queueMicrotask(fn)`
- `setTimeout(fn, ms, ...args)`
- `clearTimeout(id)`
- `setInterval(fn, ms, ...args)`
- `clearInterval(id)`
- `sleep(ms)`

Timer callbacks still run under the per-event budget.

### Commands

- `command(name, fn)`
- `exec(cmd)`

Behavior:

- `name` is trimmed and lowercased
- plugin commands receive the command tail as a string
- handlers may be async
- built-in `:` commands run first
- unknown commands are offered to every loaded plugin in order
- duplicate command names all run
- `exec(cmd)` trims an optional leading `:`

## Host events

| Event | Payload |
| --- | --- |
| `open` | `{ path, tab, tab_count }` |
| `tab_change` | `{ from, to, tab_count }` |
| `search` | `{ query, regex, ignore_case }` |
| `copy` | `{ bytes }` |
| `quit` | no payload |

Example:

```js
on('search', ({ query, regex, ignore_case }) => {
  console.info('search', JSON.stringify({ query, regex, ignore_case }))
})
```

## Security model

The runtime has guardrails, but it is not a secure sandbox.

Strong boundaries:

- per-plugin QuickJS runtime/context
- module-root import confinement
- plugin load and event timeouts
- plugin memory and stack limits
- bounded `sage:fs` access
- per-plugin disable on timeout or fatal runtime failure

Non-boundaries you should document honestly:

- `sage:process.exec()` runs `/bin/sh -c` as the current user
- `sage:env.set()` and `sage:env.unset()` mutate the host process environment
- `fetch()` can make outbound HTTP(S) requests

## Default limits

| Limit | Default |
| --- | --- |
| plugin load timeout | `500ms` |
| per-event timeout | `50ms` |
| memory limit | `64MiB` |
| stack limit | `1024KiB` |
| `exec(cmd)` queue length | `256` |
| `exec(cmd)` command length | `4096` characters |

## Logging and failure behavior

- most handler exceptions are caught and logged
- async rejections are logged
- timer callback exceptions are logged
- timeouts disable the offending plugin
- if the plugin log file cannot be opened, logs fall back to `/dev/null` unless `SAGE_PLUGIN_LOG_STDERR=1`

## Example references

- [`examples/plugins/00-log-events.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/00-log-events.js)
- [`examples/plugins/10-commands.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/10-commands.js)
- [`examples/plugins/20-session-stats.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/20-session-stats.js)

