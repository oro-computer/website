# `sage:navigator`

`sage:navigator` exposes a browser-like `navigator` object.

## Import

```js
import navigator, { Navigator } from 'sage:navigator'
```

Exports:

- default export: `navigator`
- named export: `Navigator`

## Available properties

- `navigator.appName`
- `navigator.appVersion`
- `navigator.userAgent`

The bootstrap also installs `navigator` on `globalThis`.

## Example

```js
import navigator from 'sage:navigator'

command('ua', () => {
  console.info(navigator.userAgent)
})
```

## Related

- runtime detection: `isSageRuntime === true`
- logging example: [`examples/plugins/00-log-events.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/00-log-events.js)
