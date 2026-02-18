# `oro:notification`

`oro:notification` provides an API to display desktop and mobile notifications and request permission to use them.

## Import

```js
import Notification, { showNotification } from 'oro:notification'
```

## Permissions

```js
const state = await Notification.requestPermission()
console.log(state) // 'granted' | 'default' | 'denied'
```

On macOS/iOS you can pass options like `alert`, `sound`, and `badge`.

## Show a notification

```js
await showNotification('Hello', { body: 'From Oro Runtime' })
```

## Observe notification events

The runtime also emits global notification events through `oro:hooks`:

```js
import { onNotificationPresented, onNotificationResponse } from 'oro:hooks'

onNotificationPresented((event) => {
  console.log('presented:', event)
})

onNotificationResponse((event) => {
  console.log('response:', event)
})
```

