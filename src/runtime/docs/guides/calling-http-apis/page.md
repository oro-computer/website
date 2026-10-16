---
layout: "docs"
description: "Use global fetch with cancellation, response validation, and safe local persistence."
docsCollection: "runtime"
section: "guides"
order: 11
sourcePath: "guides/calling-http-apis.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Calling HTTP APIs

Load a remote note list with the global `fetch`, reject malformed responses, and report network errors without losing local drafts. No import is needed for `fetch`, `Headers`, `Request`, `Response`, `URL`, or `AbortController`.

## Fetch and validate a response

Save as `src/remote-notes.js`. This complete module expects an HTTPS endpoint returning an array of `{ id, title, body }` objects. Replace the example origin with your API’s address.

```js
const apiBase = 'https://api.example.com/'

function parseNotes(value) {
  if (!Array.isArray(value)) throw new Error('Expected a list of notes')

  const seen = new Set()
  return value.map((note) => {
    if (!note || !Number.isSafeInteger(note.id) || note.id <= 0 ||
        typeof note.title !== 'string' || typeof note.body !== 'string') {
      throw new Error('A note has an invalid id, title, or body')
    }
    if (seen.has(note.id)) throw new Error('The response contains duplicate note ids')
    seen.add(note.id)
    return { id: note.id, title: note.title, body: note.body }
  })
}

export async function fetchNotes({ accessToken, signal } = {}) {
  const url = new URL('/notes', apiBase)
  url.searchParams.set('limit', '100')
  const headers = new Headers({ accept: 'application/json' })
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)

  const response = await fetch(url.href, { headers, signal })
  if (!response.ok) throw new Error(`Could not load notes (HTTP ${response.status})`)
  return parseNotes(await response.json())
}
```

`fetch` rejects network failures, but an HTTP 404 or 500 still produces a response. Check `ok` before decoding. `json()` parses JSON; `parseNotes` checks the application’s data shape. For a paginated API, follow its cursor or next-page contract before treating a response as the complete collection.

## Cancel stale work and show failures

Call the module from a view with a reload button and a status element. Here `status` is an element with `role="status"`, and `renderNotes` renders titles and bodies as text.

```js
import { fetchNotes } from './remote-notes.js'

let activeRequest

async function reloadNotes({ accessToken, status, renderNotes }) {
  activeRequest?.abort()
  const request = new AbortController()
  activeRequest = request
  const timeout = setTimeout(() => request.abort(), 15000)
  status.textContent = 'Loading notes…'

  try {
    const notes = await fetchNotes({ accessToken, signal: request.signal })
    if (activeRequest !== request) return
    renderNotes(notes)
    status.textContent = `Loaded ${notes.length} notes.`
  } catch (error) {
    if (activeRequest !== request) return
    status.textContent = request.signal.aborted
      ? 'Request cancelled or timed out. Your local notes are still available.'
      : `Could not load notes: ${error.message}`
  } finally {
    clearTimeout(timeout)
    if (activeRequest === request) activeRequest = undefined
  }
}
```

Keep existing content visible while loading. Render remote strings with `textContent` or ordinary React text children. For authenticated calls, pass a short-lived access token from your sign-in flow; use [secure storage](/runtime/docs/guides/secure-storage-and-sessions/) for credentials that must survive restarts. Handle expiry through your API’s token refresh flow.

## Store validated notes with bound SQL parameters

For a database with `notes(id, title, body, created_at, updated_at)` from the [SQLite guide](/runtime/docs/guides/local-data-with-sqlite/), upsert a validated page in one transaction:

```js
export function storeRemoteNotes(db, notes) {
  const syncedAt = new Date().toISOString()
  db.exec('BEGIN')
  try {
    for (const note of notes) {
      db.exec(`
        INSERT INTO notes (id, title, body, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          body = excluded.body,
          updated_at = excluded.updated_at
      `, { params: [note.id, note.title, note.body, syncedAt, syncedAt] })
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
```

Bound values preserve quotes and newlines without turning data into SQL. The transaction avoids half-written pages. This example caches a server-owned list; keep unsent local drafts separate and design conflict resolution before adding two-way sync. A failed fetch never deletes local rows.

## Choose the network API for the task

Use global `fetch` for JSON APIs, downloads, and uploads. [`oro:http`](/runtime/docs/javascript/http/) and [`oro:https`](/runtime/docs/javascript/https/) expose Node-style request and stream interfaces. Native TLS provider availability differs from WebView HTTPS; see [platform support](/runtime/docs/guides/platform-support/).

## Next

- [Web platform APIs](/runtime/docs/guides/web-platform-apis/)
- [Local data with SQLite](/runtime/docs/guides/local-data-with-sqlite/)
- [Offline-first with service workers](/runtime/docs/guides/offline-first-with-service-workers/)
