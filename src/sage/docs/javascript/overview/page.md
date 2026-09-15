---
layout: "docs"
description: "sage can load JavaScript plugins in the interactive TUI path. Plugins run as ES modules on top of QuickJS and can extend the pager with custom commands, event handlers, bounded filesystem state, child"
docsCollection: "sage"
section: "javascript"
order: 12
sourcePath: "javascript/overview.md"
githubRepo: "oro-computer/sage"
githubRef: "master"
---

# JavaScript APIs overview

[`sage`](/sage/docs/cli/sage/) can load JavaScript plugins in the interactive TUI path. Plugins run as ES modules on top of QuickJS and can extend the pager with custom commands, event handlers, bounded filesystem state, child-process helpers, and HTTP(S) requests.

## What is stable

Stable public surfaces:

- globals installed by the bootstrap
- host events
- `command(name, fn)` and `exec(cmd)`
- built-in ES modules under the `sage:*` namespace

Stable modules:

- [`sage:fs`](/sage/docs/javascript/fs/)
- [`sage:path`](/sage/docs/javascript/path/)
- [`sage:process`](/sage/docs/javascript/process/)
- [`sage:env`](/sage/docs/javascript/env/)
- [`sage:navigator`](/sage/docs/javascript/navigator/)
- [`sage:performance`](/sage/docs/javascript/performance/)
- [`sage:crypto`](/sage/docs/javascript/crypto/)
- [`sage:uuid`](/sage/docs/javascript/uuid/)
- [`sage:url`](/sage/docs/javascript/url/)
- [`sage:core/dom`](/sage/docs/javascript/dom/)
- [`sage:core/web`](/sage/docs/javascript/web/)
- [`sage:fetch`](/sage/docs/javascript/fetch/)

## What is not stable

These exist for implementation support and should not be treated as public API:

- `sage:core/global`
- `sage:internal/host`

## Reading order

1. [JavaScript runtime](/sage/docs/javascript/runtime/)
2. [Module index](/sage/docs/javascript/module-index/)
3. [All module specifiers](/sage/docs/javascript/all-modules/)
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
