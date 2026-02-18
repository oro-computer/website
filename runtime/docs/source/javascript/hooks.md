# `oro:hooks`

`oro:hooks` provides a consistent way to subscribe to runtime-delivered lifecycle and system events.

Most hooks:

- register a callback
- return a disposer function you can call to unsubscribe

## Common hooks

```js
import {
  onInit,
  onLoad,
  onReady,
  onError,
  onMessage,
  onOnline,
  onOffline,
  onApplicationURL,
  onApplicationPause,
  onApplicationResume,
} from 'oro:hooks'

onInit(() => {
  // runtime initialized (once)
})

onReady(() => {
  // Window + Document + Runtime are ready (once)
})

onError((event) => {
  console.error('global error:', event)
})

onMessage((event) => {
  console.log('message:', event.data)
})
```

## Deep links: `onApplicationURL`

When the OS opens your app via a registered URL protocol, handle it with `onApplicationURL`.

```js
import { onApplicationURL } from 'oro:hooks'

onApplicationURL((event) => {
  if (!event.isValid) return
  console.log('opened:', event.url.href)
})
```

The URL parser uses your configured `meta.application_protocol` when normalizing scheme URLs.

## Waiting for a single hook event

`wait(...)` returns a Promise that resolves when a hook event occurs:

```js
import { wait } from 'oro:hooks'

await wait('__runtime_ready__')
```

