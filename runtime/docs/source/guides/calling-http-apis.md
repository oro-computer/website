# Calling HTTP APIs

Most production applications spend their time moving between three layers:

- local state,
- remote APIs,
- UI that reflects sync state honestly.

Oro Runtime gives you the standard `fetch` path plus lower-level `oro:http` and `oro:https` surfaces when you need them.

## 1) Start with `oro:fetch`

Use `oro:fetch` exactly the way you would use the web platform `fetch` API:

```js
import fetch from 'oro:fetch'

const response = await fetch('https://api.example.com/notes')
const notes = await response.json()
```

That keeps most application code portable and familiar.

## 2) Attach stored credentials

Pair API calls with `oro:secure-storage` so session state survives restarts:

```js
import fetch from 'oro:fetch'
import * as secureStorage from 'oro:secure-storage'

export async function fetchNotes() {
  const token = await secureStorage.getItem('refresh-token')

  const response = await fetch('https://api.example.com/notes', {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  })

  if (!response.ok) throw new Error(`sync failed: ${response.status}`)
  return await response.json()
}
```

## 3) Use explicit sync functions

Keep network behavior out of click handlers:

```js
export async function syncNotes(db) {
  const remoteNotes = await fetchNotes()

  db.exec('delete from notes')
  for (const note of remoteNotes) {
    db.exec(`
      insert into notes (id, title, body, created_at, updated_at)
      values (
        ${Number(note.id)},
        ${JSON.stringify(note.title)},
        ${JSON.stringify(note.body)},
        ${JSON.stringify(note.created_at)},
        ${JSON.stringify(note.updated_at)}
      )
    `)
  }
}
```

The runtime is not the place to hide network state. Make sync operations explicit and observable.

## 4) Use `oro:https` when you need stream-style control

For simple downloads, `fetch` is enough. For Node-style request handling or low-level streaming, drop to `oro:https`:

```js
import { get } from 'oro:https'
import process from 'oro:process'

get('https://example.com/health', (res) => {
  res.on('data', (chunk) => process.stdout.write(chunk))
})
```

That is useful for long-lived connections, custom headers, or stream-oriented integrations.

## 5) Debug TLS issues without guessing

When a remote API handshake is failing and you need to inspect TLS behavior:

```bash
oroc run . --tls-keylog=./tls-keys.log
```

That gives you a deterministic artifact you can use during debugging instead of blindly retrying requests.

## Considerations

- Use `fetch` by default. Drop to `oro:http` or `oro:https` only when you need stream-level control.
- Store durable remote data in SQLite, not only in memory.
- Treat sync as a feature with its own state: pending, success, stale, failed.

## Next

- [Local data with SQLite](?p=guides/local-data-with-sqlite)
- [Offline-first with service workers](?p=guides/offline-first-with-service-workers)
- [`oro:fetch`](?p=javascript/fetch)
