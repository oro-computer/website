# `sage:crypto`

`sage:crypto` provides random bytes and UUID v4 generation.

## Import

```js
import crypto, { Crypto, installGlobals } from 'sage:crypto'
```

The bootstrap already installs `crypto` globally.

Named exports:

- `Crypto`
- `crypto`
- `installGlobals`
- default export `crypto`

## API

### `crypto.getRandomValues(typedArray)`

Fills an integer typed array with secure random bytes.

Rules:

- only integer typed arrays are accepted
- the request is capped at `65536` bytes

### `crypto.randomUUID()`

Returns a UUID v4 string.

### `installGlobals()`

Installs `crypto` on `globalThis`.

## Example

```js
import crypto from 'sage:crypto'

command('rand', () => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  console.info(Array.from(bytes))
})

command('uuid', () => {
  console.info(crypto.randomUUID())
})
```

## Upstream examples

- [`examples/plugins/82-crypto.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/82-crypto.js)
