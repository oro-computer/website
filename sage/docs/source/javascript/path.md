# `sage:path`

`sage:path` is a small POSIX-style path helper module.

## Import

```js
import path from 'sage:path'
```

Named exports are also available:

```js
import { isAbsolute, normalize, join, dirname, basename, extname, resolve } from 'sage:path'
```

## API

- `path.isAbsolute(p)`
- `path.normalize(p)`
- `path.join(...parts)`
- `path.dirname(p)`
- `path.basename(p, ext?)`
- `path.extname(p)`
- `path.resolve(...parts)`

## Example

```js
import path from 'sage:path'

command('path-demo', () => {
  console.info(path.join('/tmp', 'sage', 'demo.txt'))
  console.info(path.dirname('/tmp/sage/demo.txt'))
  console.info(path.basename('/tmp/sage/demo.txt'))
  console.info(path.extname('/tmp/sage/demo.txt'))
  console.info(path.resolve('plugins', '../plugins/10-hello.js'))
})
```

## Upstream examples

- [`examples/plugins/72-imports.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/72-imports.js)
