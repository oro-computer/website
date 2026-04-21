# Lifecycle hooks and deep links

Lifecycle hooks are where the application stops being a generic page and starts reacting like a native application. Use
them for readiness, connectivity, backgrounding, and OS-delivered URLs.

## 1) Centralize lifecycle subscriptions

`src/main.js`:

```js
import {
  onReady,
  onOnline,
  onOffline,
  onApplicationPause,
  onApplicationResume,
  onApplicationURL,
} from 'oro:hooks'

onReady(() => {
  console.log('runtime ready')
})

onOnline(() => console.log('back online'))
onOffline(() => console.log('offline'))
onApplicationPause(() => console.log('app paused'))
onApplicationResume(() => console.log('app resumed'))
```

This keeps environment events separate from view rendering logic.

## 2) Handle deep links through one routing function

```js
function openRoute(route) {
  history.pushState({}, '', route)
  console.log('navigated to', route)
}

onApplicationURL((event) => {
  if (!event.isValid) return

  const route = `${event.url.pathname}${event.url.search}`
  openRoute(route)
})
```

If the OS launches the app with a URL, that route now flows through the same navigation path the UI uses internally.

## 3) Use hooks to protect app state

When the app pauses, snapshot important in-memory state:

```js
import { onApplicationPause } from 'oro:hooks'

onApplicationPause(async () => {
  localStorage.setItem('draft-open-note-id', '42')
})
```

When it resumes, restore or refresh as needed:

```js
import { onApplicationResume } from 'oro:hooks'

onApplicationResume(() => {
  console.log('resume sync')
})
```

## 4) Treat connectivity as a UI input

Offline is not an edge case:

```js
import { onOnline, onOffline } from 'oro:hooks'

onOffline(() => document.body.dataset.online = 'false')
onOnline(() => document.body.dataset.online = 'true')
```

That is the difference between a graceful offline app and one that just throws fetch errors.

## Considerations

- Subscribe once near startup, not in every component.
- Keep hook handlers small and route them into app services or state containers.
- Deep links should reuse normal navigation and data-loading paths instead of inventing a second entry path.

## Next

- [Custom protocols and routing](?p=guides/custom-protocols-and-routing)
- [Desktop integrations](?p=guides/desktop-integrations)
- [`oro:hooks`](?p=javascript/hooks)
