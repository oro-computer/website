# `sage:url`

`sage:url` implements WHATWG-style `URL` and `URLSearchParams`.

## Import

```js
import url, { URL, URLSearchParams, installGlobals } from 'sage:url'
```

The bootstrap also installs `URL` and `URLSearchParams` globally.

Exports:

- `URL`
- `URLSearchParams`
- `installGlobals()`
- default export `{ URL, URLSearchParams, installGlobals }`

## `URLSearchParams`

Constructor inputs:

- another `URLSearchParams`
- query string
- array of `[name, value]` pairs
- iterable of pairs
- plain object

API:

- `new URLSearchParams(init?)`
- `.size`
- `.append(name, value)`
- `.delete(name, value?)`
- `.get(name)`
- `.getAll(name)`
- `.has(name, value?)`
- `.set(name, value)`
- `.sort()`
- `.forEach(fn, thisArg?)`
- `.entries()`, `.keys()`, `.values()`, iteration
- `.toString()`

## `URL`

API:

- `new URL(url, base?)`
- `URL.parse(url, base?)`
- `URL.canParse(url, base?)`
- `.href`
- `.origin`
- `.protocol`
- `.username`
- `.password`
- `.host`
- `.hostname`
- `.port`
- `.pathname`
- `.search`
- `.searchParams`
- `.hash`
- `.toString()`
- `.toJSON()`

Notes:

- `searchParams` stays live with the owning URL
- `URL.parse()` returns `null` instead of throwing
- `URL.canParse()` returns a boolean

## Example

```js
import { URL } from 'sage:url'

command('url-demo', () => {
  const u = new URL('/rel/path?x=1', 'https://example.com/base/dir/')
  u.searchParams.append('ts', String(Date.now()))
  console.info(u.href)
  console.info(URL.canParse('https://example.com'))
})
```

## Upstream examples

- [`examples/plugins/81-url.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/81-url.js)
