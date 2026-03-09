# `sage:process`

`sage:process` exposes process metadata plus bounded shell execution.

## Import

```js
import process from 'sage:process'
```

Named exports:

```js
import { pid, ppid, cwd, exec } from 'sage:process'
```

## API

### `process.pid`

Host process ID.

### `process.ppid`

Parent process ID.

### `await process.cwd()`

Returns the current working directory as a string.

### `await process.exec(cmd, opts?)`

Runs:

```text
/bin/sh -c <cmd>
```

Options:

- `timeoutMs` — default `30000`
- `maxBytes` — default `1048576`

Resolve shape:

```js
{
  code,
  stdout,
  stderr,
  timedOut,
  truncated,
  signal
}
```

Important behavior:

- non-zero exit does **not** reject
- timeout rejects
- output truncation rejects
- the host hard-caps timeout at ten minutes
- the host hard-caps output at `16MiB`

## Example

```js
import process from 'sage:process'

command('cwd', async () => {
  console.info(await process.cwd())
})

command('sh', async (args) => {
  const cmd = String(args || '').trim()
  if (!cmd) return
  const res = await process.exec(cmd, { timeoutMs: 5000, maxBytes: 256 * 1024 })
  console.info('code', res.code)
  console.info('stdout', JSON.stringify(res.stdout))
  console.info('stderr', JSON.stringify(res.stderr))
})
```

## Upstream examples

- [`examples/plugins/70-process.js`](https://github.com/oro-computer/sage/blob/master/examples/plugins/70-process.js)
