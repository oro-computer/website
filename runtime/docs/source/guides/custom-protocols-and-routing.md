# Custom protocols and routing

Some apps need more than a single `https://`-style origin. Custom protocols let you give internal resources a stable
shape and route them through service-worker logic instead of hard-coding filesystem paths or special-case branches in UI code.

## 1) Declare the protocols you want the runtime to treat as app-safe

```toml
[webview]
url_protocols = "notes"
protocol_handlers = "notes"
```

This tells the runtime that `notes:` is part of the app’s URL model rather than an arbitrary external scheme.

## 2) Route the protocol in a service worker

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

Now any request for `notes://123` can be handled in a controlled, testable place.

## 3) Inspect the registered handler from app code

`oro:protocol-handlers` lets you ask the runtime which service worker is currently bound to a scheme:

```js
import { getServiceWorker } from 'oro:protocol-handlers'

const worker = await getServiceWorker({ scheme: 'notes' })
console.log(worker)
```

That is useful when debugging route ownership and protocol bootstrapping.

## 4) Use protocol handlers for clarity, not novelty

Good uses:

- internal document references,
- app-scoped asset URLs,
- virtual endpoints that should never hit the network.

Bad uses:

- replacing every normal relative path,
- hiding business logic behind clever URL tricks,
- inventing new schemes when a normal route would do.

## 5) Pair protocols with explicit window creation

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

That keeps the routing model consistent across windows instead of only working in the primary one.

## Next

- [Offline-first with service workers](?p=guides/offline-first-with-service-workers)
- [Lifecycle hooks and deep links](?p=guides/lifecycle-hooks-and-deep-links)
- [`oro:protocol-handlers`](?p=javascript/protocol-handlers)
