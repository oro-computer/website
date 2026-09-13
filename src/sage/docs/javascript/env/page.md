---
layout: "docs"
title: "sage:env"
description: "sage:env reads and mutates the host process environment."
docsCollection: "sage"
section: "javascript"
order: 19
sourcePath: "javascript/env.md"
githubRepo: "oro-computer/sage"
githubRef: "master"
---

# [`sage:env`](/sage/docs/javascript/env/)

[`sage:env`](/sage/docs/javascript/env/) reads and mutates the host process environment.

## Import

```js
import env from 'sage:env'
```

Named exports:

```js
import { get, set, unset } from 'sage:env'
```

## API

- `await env.get(name)`
- `await env.set(name, value, { overwrite?: boolean }?)`
- `await env.unset(name)`

## Important caveat

This is not plugin-local state. It mutates the real process environment of the host pager.

Use it only when that is the behavior you want.

## Example

```js
import env from 'sage:env'

command('env-get', async (args) => {
  const name = String(args || '').trim()
  if (!name) return
  console.info(await env.get(name))
})
```

## Upstream examples

- [`examples/plugins/70-process.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/70-process.js)
