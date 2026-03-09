# `sage:core/dom`

`sage:core/dom` provides `DOMException` and `structuredClone`.

## Import

```js
import dom, { DOMException, structuredClone, installGlobals } from 'sage:core/dom'
```

The bootstrap also installs both on `globalThis`.

Exports:

- `DOMException`
- `structuredClone(value, options?)`
- `installGlobals()`
- default export `{ DOMException, structuredClone, installGlobals }`

## `DOMException`

```js
const err = new DOMException('The operation was aborted.', 'AbortError')
```

Available behavior:

- `name`
- `message`
- `code`
- standard DOMException numeric constants on the constructor

## `structuredClone(value, options?)`

Supported broadly for:

- primitives
- `ArrayBuffer`
- typed arrays and `DataView`
- `Date`
- `RegExp`
- `Map`
- `Set`
- `URL`
- `URLSearchParams`
- `Headers`
- `Error`
- plain objects and arrays
- cyclic graphs

Not supported:

- transfer lists
- functions
- symbols
- accessor properties
- arbitrary custom object types

When unsupported, it throws `DOMException` with `name === 'DataCloneError'`.

## Example

```js
import { DOMException, structuredClone } from 'sage:core/dom'

command('dom-demo', () => {
  const src = { map: new Map([['k', 1]]) }
  src.self = src
  const clone = structuredClone(src)
  console.info(clone.self === clone)

  try {
    structuredClone({ fn() {} })
  } catch (err) {
    console.info(err.name, err.message)
  }
})
```

## Upstream examples

- [`examples/plugins/83-dom.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/83-dom.js)
