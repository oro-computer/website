# `oro:fs`

`oro:fs` provides filesystem APIs modeled on POSIX and Node.js.

## Import

The sync/callback surface:

```js
import * as fs from 'oro:fs'
```

Promises:

```js
import * as fs from 'oro:fs/promises'
```

## Basic example

```js
import * as fs from 'oro:fs/promises'

await fs.mkdir('./data', { recursive: true })
await fs.writeFile('./data/hello.txt', 'hello', 'utf8')
const text = await fs.readFile('./data/hello.txt', 'utf8')
console.log(text)
```

## Sandboxing

The runtime can restrict filesystem access via configuration. Common keys:

- `filesystem.sandbox_enabled`
- `filesystem.no_follow_symlinks`

See: [Config reference](?p=config/reference).

