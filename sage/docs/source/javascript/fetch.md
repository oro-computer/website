# `sage:fetch`

`sage:fetch` is the host-backed WHATWG-style network module.

## Import

```js
import fetch, {
  Headers,
  Request,
  Response,
  FormData,
  Blob,
  AbortController,
  AbortSignal,
  installGlobals,
} from 'sage:fetch'
```

The bootstrap also installs `fetch` globally.

Exports:

- `fetch`
- `installGlobals()`
- re-exported `TextEncoder`, `TextDecoder`, `ReadableStream`, `Blob`, `FormData`, `Headers`, `Request`, `Response`, `AbortController`, `AbortSignal`
- default export containing the same public surface

## API

### `await fetch(input, init?)`

Standard inputs:

- URL string
- `Request`

Standard `init` fields are supported through `Request`.

Sage-specific `init` fields:

- `timeoutMs` — default `30000`
- `maxBytes` — default `16777216`
- `followRedirects` — default `true`

The `signal` field is supported through the request/init object.

### `installGlobals()`

Installs `fetch` on `globalThis`, and installs the web primitives if they are missing.

## Behavior

- only `http` and `https` are supported
- redirects are capped at 10
- responses are fully buffered in memory
- TLS verifies system CAs by default
- `SAGE_FETCH_INSECURE=1` disables certificate verification
- `SSL_CERT_FILE` can point to a PEM CA bundle

## Example: GET

```js
command('fetch', async (args) => {
  const url = String(args || '').trim() || 'https://example.com/'
  const res = await fetch(url, { timeoutMs: 15000, maxBytes: 1024 * 1024 })
  console.info(res.status, res.statusText)
  console.log((await res.text()).slice(0, 300))
})
```

## Example: abort

```js
command('fetch-abort', async () => {
  const ac = new AbortController()
  ac.abort()

  try {
    await fetch('https://example.com/', { signal: ac.signal })
  } catch (err) {
    console.warn(err.name, err.message)
  }
})
```

## Example: `FormData`

```js
command('fetch-post-form', async () => {
  const body = new FormData()
  body.append('hello', 'world')
  body.append('ts', String(Date.now()))

  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    body,
    timeoutMs: 15000,
    maxBytes: 1024 * 1024,
  })

  console.log((await res.text()).slice(0, 300))
})
```

## Upstream examples

- [`examples/plugins/80-fetch.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/80-fetch.js)
