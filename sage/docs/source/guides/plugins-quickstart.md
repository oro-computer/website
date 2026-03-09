# Plugins quickstart

`sage` can load JavaScript plugins in the interactive TUI path. Plugins are a good fit when you want:

- event-driven automation
- custom `:` commands
- bounded filesystem state
- shell-outs to helper tools
- lightweight network requests

## Install a plugin

Create the plugin directory:

```bash
mkdir -p ~/.config/sage/plugins
```

Add `~/.config/sage/plugins/10-hello.js`:

```js
on('open', ({ path, tab, tab_count }) => {
  console.info('open', path, `tab=${tab}/${tab_count}`)
})

command('hello', (args) => {
  console.log('hello', String(args || '').trim())
})
```

Open a file with plugin logging enabled:

```bash
SAGE_CONSOLE_LEVEL=info sage README.md
```

Then run:

```text
:hello from-plugin
```

## Loading rules

Plugins are loaded from `*.js` files in lexicographic order from:

1. `--plugins-dir PATH` or `.sagerc` `plugins_dir`, unless `SAGE_PLUGINS_DIR` is set
2. `SAGE_PLUGINS_DIR`
3. `XDG_CONFIG_HOME/sage/plugins`
4. `$HOME/.config/sage/plugins`

Disable plugins with any of:

```bash
sage --no-plugins README.md
SAGE_NO_PLUGINS=1 sage README.md
```

## A few real examples

The upstream repository already includes a good example set:

- [`examples/plugins/00-log-events.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/00-log-events.js)
- [`examples/plugins/10-commands.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/10-commands.js)
- [`examples/plugins/60-fs.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/60-fs.js)
- [`examples/plugins/70-process.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/70-process.js)
- [`examples/plugins/80-fetch.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/80-fetch.js)

## What plugins can import

Stable built-in modules:

- `sage:fs`
- `sage:path`
- `sage:process`
- `sage:env`
- `sage:navigator`
- `sage:performance`
- `sage:crypto`
- `sage:uuid`
- `sage:url`
- `sage:core/dom`
- `sage:core/web`
- `sage:fetch`

See [JavaScript APIs overview](?p=javascript/overview) and [Module index](?p=javascript/module-index).

## Limits and caveats

- each plugin gets its own QuickJS runtime/context
- load time, per-event time, memory, and stack are bounded
- handler exceptions are typically logged, not fatal to `sage`
- duplicate plugin command names all run; dispatch does not stop at the first handler
- this is an automation runtime with guardrails, not an OS sandbox

See [JavaScript runtime](?p=javascript/runtime) for the exact rules.

