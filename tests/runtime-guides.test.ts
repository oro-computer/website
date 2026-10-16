import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { load } from 'cheerio'
import { markdown } from '#lib/markdown.ts'
import { publicContent } from '../tools/ingestion/content.ts'

const $ = load(markdown().render(await readFile('src/runtime/docs/guides/calling-http-apis/page.md', 'utf8')))
const snippets = $('code.language-js').toArray().map(element => $(element).text())
const moduleFrom = (code: string) => import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

test('published HTTP example validates remote input and forwards authentication and cancellation', async t => {
  const { fetchNotes } = await moduleFrom(snippets[0])
  let payload: unknown = [{ id: 1, title: 'Trail', body: 'Bring water' }]
  let status = 200
  const requests: { url: string; options: RequestInit }[] = []
  t.mock.method(globalThis, 'fetch', async (url: string, options: RequestInit) => {
    requests.push({ url, options })
    return new Response(JSON.stringify(payload), { status })
  })
  const controller = new AbortController()
  assert.deepEqual(await fetchNotes({ accessToken: 'test-token', signal: controller.signal }), payload)
  assert.equal(requests[0].url, 'https://api.example.com/notes?limit=100')
  assert.equal((requests[0].options.headers as Headers).get('authorization'), 'Bearer test-token')
  assert.equal(requests[0].options.signal, controller.signal)
  for (const malformed of [{}, [{ id: '1', title: 'Trail', body: '' }], [null], [
    { id: 1, title: '', body: '' }, { id: 1, title: '', body: '' },
  ]]) {
    payload = malformed
    await assert.rejects(fetchNotes(), /Expected a list|invalid|duplicate/)
  }
  status = 503
  await assert.rejects(fetchNotes(), /HTTP 503/)
  assert.equal((requests.at(-1)!.options.headers as Headers).has('authorization'), false)
})

test('published SQL example stores quoted text and rolls back a partially failed page', async () => {
  const { storeRemoteNotes } = await moduleFrom(snippets[2])
  const sqlite = new DatabaseSync(':memory:')
  const db = {
    exec(sql: string, options?: { params: (string | number)[] }) {
      if (options?.params) return sqlite.prepare(sql).run(...options.params)
      return sqlite.exec(sql)
    },
  }
  try {
    db.exec('CREATE TABLE notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)')
    const body = 'Meet O\'Brien\n"Bring a map"; DROP TABLE notes;'
    storeRemoteNotes(db, [{ id: 1, title: 'Trail', body }])
    assert.equal(sqlite.prepare('SELECT body FROM notes WHERE id = 1').get()!.body, body)
    assert.throws(() => storeRemoteNotes(db, [
      { id: 1, title: 'Changed', body: 'must roll back' },
      { id: 2, title: null, body: 'constraint failure' },
    ]), /NOT NULL/)
    assert.equal(sqlite.prepare('SELECT body FROM notes WHERE id = 1').get()!.body, body)
    assert.equal(sqlite.prepare('SELECT count(*) AS count FROM notes').get()!.count, 1)
  } finally { sqlite.close() }
})

test('Silk imports retain concrete restrictions and literal code while removing transitional prose', () => {
  const code = '```silk\nfn current () -> int { return 3; }\n```\n'
  const result = publicContent('# Bounds\n\nThe current compiler supports only 8 fields.\nIn the current implementation, overflow reports E2016.\nUse the current working directory.\n\n' + code, 'silk', 'language/bounds.md')
  assert.match(result, /supports only 8 fields/)
  assert.match(result, /overflow reports E2016/i)
  assert.match(result, /current working directory/)
  assert.ok(result.endsWith(code))
  assert.doesNotMatch(result, /current (?:compiler|implementation|subset)/)
})
