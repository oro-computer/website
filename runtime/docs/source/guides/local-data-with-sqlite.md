# Local data with SQLite

Once an app moves beyond a few JSON files, SQLite is the right default. It gives you transactions, indexes, and queryable
data without adding another service to your deployment story.

This guide turns the `Field Notes` example into a local-first app with a real database.

## 1) Create the database directory

```js
import * as fs from 'oro:fs/promises'

await fs.mkdir('./data', { recursive: true })
```

## 2) Open a database

```js
import {
  open,
  OPEN_CREATE,
  OPEN_READWRITE,
} from 'oro:sqlite'

const db = open('./data/field-notes.db', {
  flags: OPEN_CREATE | OPEN_READWRITE,
})
```

Use a real on-disk path for app data. Reserve `:memory:` for tests and experiments.

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
  values ('First note', 'Built with oro:sqlite', '${now}', '${now}')
`)

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
    values (${JSON.stringify(title)}, ${JSON.stringify(body)}, '${now}', '${now}')
  `)
}

export function listNotes(db) {
  return db.query(`
    select id, title, updated_at
    from notes
    order by updated_at desc
  `)
}
```

Even if you later swap this for prepared statements or a repository layer, the app should still talk in terms of note operations, not raw SQL from button handlers.

## 6) Why this is better than ad-hoc JSON

With SQLite you get:

- predictable writes,
- fast filtering and sorting,
- transactions when sync or import gets more complex,
- one file that is easy to inspect and back up.

That is the right shape for notes, drafts, cached API data, and sync metadata.

## Next

- [Secure storage and sessions](?p=guides/secure-storage-and-sessions)
- [Calling HTTP APIs](?p=guides/calling-http-apis)
- [`oro:sqlite`](?p=javascript/sqlite)
