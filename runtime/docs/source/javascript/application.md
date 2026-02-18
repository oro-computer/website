# `oro:application`

`oro:application` exposes application-level APIs: creating windows, querying windows, menus, and runtime metadata.

## Import

```js
import application from 'oro:application'
import { createWindow } from 'oro:application'
```

## Window indices

Windows are addressed by numeric indices. The main window is typically index `0`.

```js
import application from 'oro:application'

console.log(application.getCurrentWindowIndex())
```

## Creating a window

```js
import application from 'oro:application'

await application.createWindow({
  index: 1,
  path: 'peer.html',
  title: 'Peer',
})
```

## Querying windows

```js
import application from 'oro:application'

const current = await application.getCurrentWindow()
const peer = await application.getWindow(1, { max: false })
const all = await application.getWindows()
```

## Screen size

```js
import application from 'oro:application'

const { width, height } = await application.getScreenSize()
```

## Menus

`setSystemMenu(...)` sets a native application menu using a simple DSL:

```js
import application from 'oro:application'

await application.setSystemMenu({
  index: 0,
  value: `
    App:
      About: _;
      Quit: q + Meta;
  `,
})
```

## Runtime metadata

```js
import application from 'oro:application'

console.log(application.runtimeVersion)
console.log(application.debug)
console.log(application.config.meta_bundle_identifier)
```

## Backend process control

```js
import application from 'oro:application'

await application.backend.open()
// ...
await application.backend.close()
```

