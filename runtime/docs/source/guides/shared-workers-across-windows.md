# Shared workers across windows

If one background coordinator should serve multiple windows at the same time, use a shared worker instead of one worker
per window. This is a strong fit for search indexing, presence state, websocket multiplexing, and single-writer sync loops.

## 1) Launch one shared worker from every window

`src/main.js`:

```js
import { SharedWorker } from 'oro:shared-worker'

const syncWorker = new SharedWorker(new URL('./sync-worker.js', import.meta.url))

syncWorker.port.start()
syncWorker.port.onmessage = (event) => {
  console.log('sync update', event.data)
}

syncWorker.port.postMessage({ type: 'subscribe', window: 'main' })
```

Every window that constructs the same shared worker URL connects to the same coordinator.

## 2) Handle connections once inside the worker

`src/sync-worker.js`:

```js
self.onconnect = (event) => {
  const port = event.ports[0]

  port.onmessage = (messageEvent) => {
    if (messageEvent.data?.type === 'subscribe') {
      port.postMessage({
        type: 'status',
        value: 'connected',
        window: messageEvent.data.window,
      })
    }
  }

  port.start()
}
```

That one worker can now coordinate multiple windows without duplicating state.

## 3) Use shared workers for single-owner resources

Examples:

- one websocket connection faned out to several windows,
- one sync scheduler controlling remote pushes,
- one in-memory search index reused by the whole app.

This is a better shape than letting each window create its own independent background loop.

## 4) Pair shared workers with multi-window apps

`oro:application` handles window creation. The shared worker keeps those windows consistent:

```js
import application from 'oro:application'

await application.createWindow({
  index: 1,
  path: 'details.html',
  title: 'Details',
})
```

Now both windows can talk to the same worker and see the same sync status.

## 5) Know when not to use them

Do not choose a shared worker just because it sounds more advanced.

Use it when:

- the state truly belongs to the whole app,
- more than one window needs it,
- duplication would create correctness or resource problems.

If the work is local to one window, a dedicated worker is simpler.

## Next

- [Windows and messaging](?p=guides/windows-and-messaging)
- [Worker threads for heavy work](?p=guides/worker-threads-for-heavy-work)
- [`oro:shared-worker`](?p=javascript/shared-worker)
