# Offline-first with service workers

For applications that need to keep working without reliable connectivity, service workers are the right boundary. Use
them to cache the application shell, serve known assets, and provide controlled fallback behavior when the network is gone.

## 1) Enable service workers in project config

```toml
[permissions]
allow_service_worker = true

[webview]
allow_any_route = true
```

The first line enables the runtime permission gate. The second is useful for SPA-style routing when the app shell should
handle deep routes.

## 2) Add the service worker to your bundle

`copy-map.toml`:

```toml
"./src/index.html" = "index.html"
"./src/main.js" = "main.js"
"./src/sw.js" = "sw.js"
```

If `sw.js` does not ship in the bundle, registration will fail.

## 3) Register the worker from the app

`src/main.js`:

```js
if (navigator.serviceWorker) {
  await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
}
```

That is the same mental model as the web platform, which is exactly what you want.

## 4) Cache the application shell

`src/sw.js`:

```js
const SHELL_CACHE = 'field-notes-shell-v1'
const SHELL_FILES = ['/', '/index.html', '/main.js']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    })
  )
})
```

This is enough to keep the app shell bootable even when the network is unavailable.

## 5) Keep local state authoritative

Offline support works best when:

- the UI can boot from bundled assets,
- user data lives in SQLite or files,
- sync is an explicit process that can be retried later.

Do not design the app so that every meaningful screen requires a live fetch before anything can render.

## Considerations

- Version cache names when the shell changes.
- Keep cached resources small and intentional.
- Pair service workers with a local data store so offline mode is actually useful, not just decorative.

## Next

- [Calling HTTP APIs](?p=guides/calling-http-apis)
- [Custom protocols and routing](?p=guides/custom-protocols-and-routing)
- [`oro:service-worker`](?p=javascript/service-worker)
