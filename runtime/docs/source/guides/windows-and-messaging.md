# Windows and messaging

Oro Runtime apps can create multiple windows. Windows are identified by a numeric index.

## Create a second window

Create a new window using `oro:application`:

```js
import application from 'oro:application'

await application.createWindow({
  index: 1,
  path: 'peer.html',
  title: 'Peer window',
})
```

The `path` must resolve inside your bundled resources, so make sure it’s included in your `copy_map`.

## Find existing windows

```js
import application from 'oro:application'

const peer = await application.getWindow(1)
const all = await application.getWindows()
```

## Send a message to another window

`ApplicationWindow.postMessage(...)` is the simplest way to send a message to a specific window:

```js
import application from 'oro:application'

const peer = await application.getWindow(1, { max: false })
await peer.postMessage({ type: 'ping', at: Date.now() })
```

Receive messages in any window:

```js
globalThis.addEventListener('message', (event) => {
  const payload = event.detail ?? event.data
  console.log('message:', payload)
})
```

## Send structured events (advanced)

`ApplicationWindow.send(...)` lets you set an explicit event name:

```js
import application from 'oro:application'

const current = await application.getCurrentWindow()
await current.send({ window: 1, event: 'message', value: { hello: 'world' } })
```

## Next

- JavaScript APIs: [`oro:application`](?p=javascript/application) · [`oro:window`](?p=javascript/window)

