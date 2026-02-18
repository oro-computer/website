# `oro:secure-storage`

`oro:secure-storage` stores secrets scoped by origin (for example tokens, credentials, API keys).

## Import

```js
import * as secureStorage from 'oro:secure-storage'
```

## Store and retrieve a token

```js
import * as secureStorage from 'oro:secure-storage'

await secureStorage.setItem('authToken', 'secret-token-value')
const token = await secureStorage.getItem('authToken')
```

## Scopes

By default, secure storage uses `location.origin` as the scope (when available). You can override the scope explicitly:

```js
await secureStorage.setItem('key', 'value', { scope: 'https://example.com' })
```

## Encodings and binary values

For strings, `encoding` may be `utf8` (default), `base64`, or `hex`.

For binary values, pass a `Uint8Array`, `ArrayBuffer`, or `Buffer`. When reading binary values, use `encoding: 'buffer'`
to get a `Uint8Array` back.

```js
const bytes = new Uint8Array([1, 2, 3])
await secureStorage.setItem('blob', bytes)

const restored = await secureStorage.getItem('blob', { encoding: 'buffer' })
```

