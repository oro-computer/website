# Custom protocols and routing

Some apps need more than a single `https://`-style origin. Custom protocols let you give internal resources a stable
shape and route them through service-worker logic instead of hard-coding filesystem paths or special-case branches in UI code.

## 1) Declare the protocol and enable service workers

```toml
[permissions]
allow_service_worker = true

[webview]
url_protocols = "notes"
protocol-handlers = "notes"
```

`url_protocols` teaches the JavaScript URL shim that `notes:` is part of the app’s URL model. `protocol-handlers`
registers the scheme with the runtime protocol-handler table so navigation and fetch routing can treat it as app-owned.

Use the hyphenated `protocol-handlers` TOML key for current Runtime builds; it maps to the flattened runtime key
`webview_protocol-handlers`.

## 2) Ship and register a service worker for that scheme

`copy-map.toml`:

```toml
"./src/index.html" = "index.html"
"./src/main.js" = "main.js"
"./src/sw.js" = "sw.js"
```

`src/main.js`:

```js
if ('serviceWorker' in navigator) {
  await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    scheme: 'notes',
  })
  await navigator.serviceWorker.ready
}
```

The `scheme` option is the important part. Without it, the worker is registered for the default runtime scheme and will
not receive `notes:` requests.

If you want the runtime to bind the script from config instead of registering it from JavaScript, use a per-scheme
handler entry instead of the scalar `protocol-handlers` list:

```toml
[webview]
url_protocols = "notes"

[webview.protocol-handlers]
notes = "/sw.js"
```

## 3) Route the protocol in the service worker

`src/sw.js`:

```js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.protocol !== 'notes:') return

  const noteId = url.pathname.replace(/^\\//, '')
  event.respondWith(
    new Response(JSON.stringify({ noteId }), {
      headers: { 'content-type': 'application/json' },
    })
  )
})
```

Now a request for `notes://local/123` can be handled in a controlled, testable place. Use a stable host such as
`local` when you want the identifier in the pathname; with `notes://123`, `123` is the URL host, not the path.

```js
const response = await fetch('notes://local/123')
const note = await response.json()
console.log(note.noteId)
```

## 4) Inspect the registered handler from app code

`oro:protocol-handlers` lets you ask the runtime which service-worker registration is currently bound to a scheme:

```js
import { getServiceWorker } from 'oro:protocol-handlers'

const worker = await getServiceWorker({ scheme: 'notes' })
console.log(worker)
```

That is useful when debugging route ownership and protocol bootstrapping.

## 5) Use protocol handlers for clarity, not novelty

Good uses:

- internal document references,
- app-scoped asset URLs,
- virtual endpoints that should never hit the network.

Bad uses:

- replacing every normal relative path,
- hiding business logic behind clever URL tricks,
- inventing new schemes when a normal route would do.

## 6) Pair protocols with explicit window creation

If a secondary window needs the same protocol support, create it with the matching handler list:

```js
import application from 'oro:application'

await application.createWindow({
  index: 1,
  path: 'details.html',
  title: 'Details',
  protocolHandlers: ['notes'],
})
```

That writes the window-local `webview_protocol-handlers_notes` config entry. The secondary window still needs a
`navigator.serviceWorker.register('/sw.js', { scope: '/', scheme: 'notes' })` call in its startup path if it must own
the route itself.

## Next

- [Offline-first with service workers](?p=guides/offline-first-with-service-workers)
- [Lifecycle hooks and deep links](?p=guides/lifecycle-hooks-and-deep-links)
- [`oro:protocol-handlers`](?p=javascript/protocol-handlers)
