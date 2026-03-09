# JavaScript APIs overview

`sage` can load JavaScript plugins in the interactive TUI path. Plugins run as ES modules on top of QuickJS and can extend the pager with custom commands, event handlers, bounded filesystem state, child-process helpers, and HTTP(S) requests.

## What is stable

Stable public surfaces:

- globals installed by the bootstrap
- host events
- `command(name, fn)` and `exec(cmd)`
- built-in ES modules under the `sage:*` namespace

Stable modules:

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

## What is not stable

These exist for implementation support and should not be treated as public API:

- `sage:core/global`
- `sage:internal/host`

## Reading order

1. [JavaScript runtime](?p=javascript/runtime)
2. [Module index](?p=javascript/module-index)
3. [All module specifiers](?p=javascript/all-modules)
4. Module pages for the APIs you plan to use

## Example plugin

```js
import fs from 'sage:fs'
import process from 'sage:process'

on('open', async ({ path }) => {
  console.info('opened', path)
  console.info('cwd', await process.cwd())
})

command('peek', async (args) => {
  const target = String(args || '').trim()
  if (!target) return
  const text = await fs.readFile(target, { encoding: 'utf8', maxBytes: 4096 })
  console.log(text.slice(0, 200))
})
```

Install it under `~/.config/sage/plugins/`.
