# `sage:core/web`

`sage:core/web` provides a host-free, in-memory set of WHATWG-style web primitives.

## Import

```js
import {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  Blob,
  FormData,
  Headers,
  Request,
  Response,
  AbortController,
  AbortSignal,
  toHostFetchRequest,
  installGlobals,
} from 'sage:core/web'
```

The bootstrap also installs all of these on `globalThis`.

Exports:

- `TextEncoder`
- `TextDecoder`
- `ReadableStream`
- `Blob`
- `FormData`
- `Headers`
- `Request`
- `Response`
- `AbortController`
- `AbortSignal`
- `toHostFetchRequest(req)`
- `installGlobals()`
- default export containing the same public surface

## Text encoding

### `TextEncoder`

- `new TextEncoder()`
- `.encode(string)`

### `TextDecoder`

- `new TextDecoder(label?)`
- `.decode(bytes)`

## `ReadableStream`

This is a minimal in-memory readable stream.

Supported constructor inputs:

- `Uint8Array`
- `ArrayBuffer`
- typed arrays
- arrays of chunks

API:

- `new ReadableStream(source?)`
- `.locked`
- `.getReader()`
- `.cancel()`
- async iteration

The reader object supports:

- `await reader.read()`
- `await reader.cancel()`
- `reader.releaseLock()`

## `Blob`

Constructor parts may include strings, byte arrays, typed arrays, `ArrayBuffer`, and other `Blob` instances.

API:

- `new Blob(parts?, { type? }?)`
- `.size`
- `.type`
- `await .arrayBuffer()`
- `await .text()`
- `.stream()`
- `.slice(start?, end?, type?)`

## `FormData`

API:

- `new FormData()`
- `.append(name, value, filename?)`
- `.set(name, value, filename?)`
- `.get(name)`
- `.getAll(name)`
- `.has(name)`
- `.delete(name)`
- `.forEach(fn, thisArg?)`
- `.entries()`, `.keys()`, `.values()`, iteration

`Blob` values are encoded as multipart form-data with a generated boundary.

## `Headers`

Constructor inputs:

- another `Headers`
- arrays of pairs
- iterables of pairs
- plain objects

API:

- `new Headers(init?)`
- `.append(name, value)`
- `.set(name, value)`
- `.get(name)`
- `.has(name)`
- `.delete(name)`
- `.forEach(fn, thisArg?)`
- `.entries()`, `.keys()`, `.values()`, iteration

Header names are normalized to lowercase.

## `Request`

API:

- `new Request(input, init?)`
- `.url`
- `.method`
- `.headers`
- `.signal`
- `.body`
- `.bodyUsed`
- `.clone()`
- `await .arrayBuffer()`
- `await .text()`
- `await .json()`
- `await .blob()`

Notes:

- `GET` and `HEAD` cannot have bodies
- string bodies default to `text/plain;charset=UTF-8`
- `Blob` bodies set `content-type` when the blob has one

## `Response`

API:

- `new Response(body?, init?)`
- `.ok`
- `.status`
- `.statusText`
- `.headers`
- `.url`
- `.body`
- `.bodyUsed`
- `.clone()`
- `await .arrayBuffer()`
- `await .text()`
- `await .json()`
- `await .blob()`
- `Response.json(data, init?)`

## Host bridge helper

### `toHostFetchRequest(req)`

Converts a `Request` instance into the host wire shape used by `sage:fetch`.

This is mostly useful if you are building helpers on top of the fetch bridge itself.

## Abort API

### `AbortSignal`

- `.aborted`
- `.reason`
- `.throwIfAborted()`

### `AbortController`

- `.signal`
- `.abort(reason?)`

## `installGlobals()`

Installs the web primitives on `globalThis`.

## Example

```js
import { Blob, FormData, Headers, Request, Response, AbortController } from 'sage:core/web'

command('web-demo', async () => {
  const fd = new FormData()
  fd.append('hello', 'world')

  const req = new Request('https://example.com/', { method: 'POST', body: fd })
  console.info(req.method, req.headers.get('content-type'))

  const res = Response.json({ ok: true })
  console.info(await res.text())

  const ac = new AbortController()
  ac.abort()
  console.info(ac.signal.aborted)
})
```
