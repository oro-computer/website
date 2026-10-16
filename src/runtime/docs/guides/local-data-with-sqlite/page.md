---
layout: "docs"
description: "Give Field Notes a SQLite database so it can store and query multiple notes on the device."
docsCollection: "runtime"
section: "guides"
order: 9
sourcePath: "guides/local-data-with-sqlite.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Local data with SQLite

Give Field Notes a SQLite database so it can store and query multiple notes on the device.

## 1) Create the database directory

```js
import * as fs from 'oro:fs/promises'
import { DATA } from 'oro:path/well-known'
import { join } from 'oro:path'

if (!DATA) throw new Error('App data directory is unavailable')
const dataDirectory = join(DATA, 'field-notes')
await fs.mkdir(dataDirectory, { recursive: true })
```

## 2) Open a database

```js
import {
  open,
  OPEN_CREATE,
  OPEN_READWRITE,
} from 'oro:sqlite'

const db = open(join(dataDirectory, 'notes.db'), {
  flags: OPEN_CREATE | OPEN_READWRITE,
})
```

The snippets in this guide continue in the same module. Use the writable app-data path on desktop and mobile; bundled resources can be read-only. Reserve `:memory:` for tests and experiments.

## 3) Create a schema on startup

```js
db.exec(`
  create table if not exists notes (
    id integer primary key,
    title text not null,
    body text not null,
    created_at text not null,
    updated_at text not null
  )
`)
```

Putting schema creation in startup code is fine for early versions. Move to explicit migrations when the schema starts changing often.

## 4) Insert and query notes

```js
const now = new Date().toISOString()

db.exec(`
  insert into notes (title, body, created_at, updated_at)
  values (?, ?, ?, ?)
`, { params: ['First note', 'Built with oro:sqlite', now, now] })

const rows = db.query(`
  select id, title, updated_at
  from notes
  order by updated_at desc
`)

console.log(rows)
```

## 5) Wrap database work in application functions

```js
export function createNote(db, title, body) {
  const now = new Date().toISOString()
  db.exec(`
    insert into notes (title, body, created_at, updated_at)
    values (?, ?, ?, ?)
  `, { params: [title, body, now, now] })
}

export function listNotes(db) {
  return db.query(`
    select id, title, updated_at
    from notes
    order by updated_at desc
  `)
}
```

The `params` array binds user text as values, preserving quotes and newlines. Call `createNote` and `listNotes` from the view; keep SQL and connection ownership in this module. Call `db.close()` when the connection is no longer needed.

## 6) Why this is better than ad-hoc JSON

With SQLite you get:

- predictable writes,
- fast filtering and sorting,
- transactions when sync or import gets more complex,
- one file that is easy to inspect and back up.

That is the right shape for notes, drafts, cached API data, and sync metadata.

## Next

- [Secure storage and sessions](/runtime/docs/guides/secure-storage-and-sessions/)
- [Calling HTTP APIs](/runtime/docs/guides/calling-http-apis/)
- [`oro:sqlite`](/runtime/docs/javascript/sqlite/)
