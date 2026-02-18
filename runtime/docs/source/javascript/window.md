# `oro:window`

`oro:window` provides the `ApplicationWindow` class and window-specific methods.

You typically do not import this module directly—get window instances via `oro:application`:

```js
import application from 'oro:application'

const current = await application.getCurrentWindow()
```

## Common operations

```js
const win = await application.getCurrentWindow()

await win.setTitle('Hello')
await win.setSize({ width: '80%', height: '80%' })
await win.navigate('index.html')
```

## Messaging

Send a message to another window:

```js
const peer = await application.getWindow(1, { max: false })
await peer.postMessage({ type: 'ping' })
```

Receive messages:

```js
globalThis.addEventListener('message', (event) => {
  const payload = event.detail ?? event.data
  console.log(payload)
})
```

## File pickers

`ApplicationWindow` exposes native file pickers:

```js
const win = await application.getCurrentWindow()

const paths = await win.showOpenFilePicker({ multiple: true })
console.log(paths)
```

