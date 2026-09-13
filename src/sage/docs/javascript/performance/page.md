---
layout: "sage-docs"
title: "sage:performance"
description: "sage:performance provides a small Performance implementation."
docsCollection: "sage"
section: "javascript"
order: 21
sourcePath: "javascript/performance.md"
githubRepo: "oro-computer/sage"
githubRef: "master"
---

# [`sage:performance`](/sage/docs/javascript/performance/)

[`sage:performance`](/sage/docs/javascript/performance/) provides a small `Performance` implementation.

## Import

```js
import performance, { Performance, installGlobals } from 'sage:performance'
```

The bootstrap already installs `performance` globally.

Named exports:

- `Performance`
- `performance`
- `installGlobals`
- default export `performance`

## API

- `performance.now()`
- `performance.timeOrigin`
- `installGlobals()`

## Example

```js
import performance from 'sage:performance'

command('perf', () => {
  console.info('now', performance.now().toFixed(3))
  console.info('timeOrigin', performance.timeOrigin)
})
```

## Upstream examples

- [`examples/plugins/82-crypto.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/82-crypto.js)
