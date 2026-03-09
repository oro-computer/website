# `sage:uuid`

`sage:uuid` provides explicit UUID helper functions.

## Import

```js
import uuid from 'sage:uuid'
```

Named exports:

```js
import { v4, v7 } from 'sage:uuid'
```

## API

- `uuid.v4()`
- `uuid.v7(unixMs?)`

`uuid.v7()` accepts an optional Unix millisecond timestamp.

## Example

```js
import uuid from 'sage:uuid'

command('uuid-demo', () => {
  console.info(uuid.v4())
  console.info(uuid.v7())
  console.info(uuid.v7(Date.now()))
})
```

## Upstream examples

- [`examples/plugins/85-uuid.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/85-uuid.js)
