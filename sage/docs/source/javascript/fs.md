# `sage:fs`

`sage:fs` provides bounded filesystem access for plugins.

## Import

```js
import fs from 'sage:fs'
```

Named exports:

```js
import {
  dataDir,
  exists,
  readFile,
  readDataFile,
  writeFile,
  appendFile,
  readdir,
} from 'sage:fs'
```

## What it can access

- currently open local files
- the plugin’s own data directory

It does not give arbitrary filesystem access.

## API

### `fs.dataDir()`

Returns the plugin data directory path.

### `await fs.exists(path)`

Returns `true` if `path` exists and is readable in the plugin sandbox.

### `await fs.readFile(path, opts?)`

Reads a currently open local file, or a file in the plugin data directory.

`opts` may be:

- `'utf8'`
- `'utf-8'`
- `{ encoding: 'utf8' | 'utf-8', maxBytes?: number }`
- `{ maxBytes?: number }`

Return type:

- string when `encoding` is set
- `Uint8Array` otherwise

### `await fs.readDataFile(name, opts?)`

Reads a file from the plugin data directory by relative name.

### `await fs.writeFile(name, data)`

Writes a plugin data file.

`data` may be:

- string
- `Uint8Array`
- `ArrayBuffer`

### `await fs.appendFile(name, data)`

Appends to a plugin data file.

### `await fs.readdir()`

Lists the files in the plugin data directory.

## Limits

- reads default to `256KiB`
- reads are capped at `4MiB`
- writes are capped at `4MiB` per call
- plugin data filenames must be relative; absolute paths and traversal are rejected by the host

## Example: read the current tab and persist state

```js
import fs from 'sage:fs'

on('open', async ({ path }) => {
  try {
    const text = await fs.readFile(path, { encoding: 'utf8', maxBytes: 4096 })
    console.info('first line', JSON.stringify(text.split('\n', 1)[0] || ''))
  } catch (err) {
    console.warn('read failed', String(err))
  }
})

command('state-save', async () => {
  await fs.appendFile('history.log', `saved=${new Date().toISOString()}\n`)
  console.info(await fs.readdir())
})
```

## Upstream examples

- [`examples/plugins/60-fs.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/60-fs.js)
