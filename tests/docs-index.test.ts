import { test } from 'node:test'
import assert from 'node:assert/strict'
import globalData, { type DocsIndex } from '../src/globals/global.data.ts'
import type { DocsData, DocVars } from '#lib/docs.ts'

type Params = Parameters<typeof globalData>[0]
type Page = Params['pages'][number]
type PageDouble = Pick<Page, 'sourceId' | 'vars' | 'readMarkdownContent' | 'renderInnerPage'> & {
  pageInfo: Pick<Page['pageInfo'], 'type' | 'url' | 'outputRelname'> & {
    pageFile: Pick<Page['pageInfo']['pageFile'], 'relname'>
  }
  markdown: string
  html: string
  calls: { read: number; render: number }
}
type Changes = { kind: 'reset'; reason: string; events: [] } |
  { kind: 'delta'; upserted: PageDouble[]; removed: string[]; events: [] }
const reset: Changes = { kind: 'reset', reason: 'test', events: [] }
const delta = (upserted: PageDouble[] = [], removed: string[] = []): Changes =>
  ({ kind: 'delta', upserted, removed, events: [] })

function page(name: string, vars: Partial<DocVars> & Record<string, unknown> = {}): PageDouble {
  return {
    sourceId: `runtime/docs/${name}.md`,
    pageInfo: {
      type: 'md', url: `/runtime/docs/${name}/`, outputRelname: `runtime/docs/${name}/index.html`,
      pageFile: { relname: `runtime/docs/${name}.md` },
    },
    vars: {
      docsCollection: 'runtime', title: name, description: `${name} summary`, section: 'overview',
      order: 0, sourcePath: `${name}.md`, githubRepo: 'oro-computer/runtime', githubRef: 'master',
      ...vars,
    },
    markdown: `# ${name}\n`, html: `<h1>${name}</h1>`, calls: { read: 0, render: 0 },
    async readMarkdownContent() { this.calls.read++; return this.markdown },
    async renderInnerPage() { this.calls.render++; return this.html },
  }
}

function copy(input: PageDouble): PageDouble {
  return {
    ...page('copy'), sourceId: input.sourceId, pageInfo: structuredClone(input.pageInfo),
    vars: structuredClone(input.vars), markdown: input.markdown, html: input.html,
  }
}

async function callback(params: {
  pages: PageDouble[]; changes: Changes; previousState: DocsIndex | undefined
  setState: Params['setState']
}) {
  // PageData has framework internals; the callback needs only the typed surface above.
  return globalData(params as unknown as Params)
}

async function invoke(pages: PageDouble[], changes: Changes, previousState?: DocsIndex) {
  const snapshots: DocsIndex[] = []
  let staged: DocsIndex | undefined
  const data = await callback({
    pages, changes, previousState,
    setState(next) { staged = next; snapshots.push(structuredClone(next)) },
  })
  assert.equal(snapshots.length, 1)
  assert.ok(staged instanceof Map)
  assert.deepEqual(staged, snapshots[0])
  return { data, state: staged, snapshot: snapshots[0] }
}
type Result = Awaited<ReturnType<typeof invoke>>

async function equivalent(pages: PageDouble[], changes: Changes, previous?: Result): Promise<Result> {
  const before = previous && structuredClone(previous.state)
  const previousData = previous && structuredClone(previous.data)
  const result = await invoke(pages, changes, previous?.state)
  const clean = await invoke(pages.map(copy), reset)
  assert.deepEqual(result.data, clean.data)
  assert.deepEqual(result.snapshot, clean.snapshot)
  if (previous) {
    assert.deepEqual(previous.state, before, 'last successful state must remain unchanged')
    assert.deepEqual(previous.state, previous.snapshot)
    assert.deepEqual(structuredClone(previous.data), previousData)
    assert.notEqual(result.state, previous.state)
    assert.notEqual(result.data.navigation, previous.data.navigation)
    assert.notEqual(result.data.runtimeExports, previous.data.runtimeExports)
    assert.notEqual(result.data.runtimeSearch, previous.data.runtimeSearch)
  }
  return result
}

function counts(pages: PageDouble[], expected: number[]) {
  assert.deepEqual(pages.map(p => p.calls), expected.map(n => ({ read: n, render: n })))
}
function clear(pages: PageDouble[]) {
  for (const p of pages) p.calls = { read: 0, render: 0 }
}

function assertAbsent(data: DocsData, sourcePath: string, id: string, url: string) {
  for (const nav of Object.values(data.navigation)) {
    assert.equal(nav.bySource[sourcePath], undefined)
    assert.equal(nav.legacy[id], undefined)
    assert.ok(nav.sections.every(section => section.items.every(item => item.sourcePath !== sourcePath)))
  }
  assert.ok(!data.routes.includes(url))
  assert.ok(data.redirects.every(redirect => redirect.to !== url))
}

test('reset caches only cloneable projections, including non-doc routes and redirects', async () => {
  const a = page('a', { redirectFrom: ['/old-a/'] })
  const b = page('b', { order: 1 })
  const landing = page('landing', { docsCollection: undefined, redirectFrom: ['/old-landing/'] })
  landing.pageInfo.type = 'html'
  a.vars.unusedRenderer = () => 'must not enter the cache'
  const result = await invoke([b, landing, a], reset)
  delete a.vars.unusedRenderer
  const clean = await invoke([b, landing, a].map(copy), reset)
  assert.deepEqual(result.data, clean.data)
  assert.deepEqual(result.snapshot, clean.snapshot)
  counts([a, b, landing], [1, 1, 0])
  assert.deepEqual([...result.state.keys()], [b.sourceId, landing.sourceId, a.sourceId])
  assert.deepEqual(result.snapshot.get(landing.sourceId), {
    pageInfo: { url: landing.pageInfo.url, outputRelname: landing.pageInfo.outputRelname,
      pageFile: { relname: landing.sourceId } },
    vars: { redirectFrom: ['/old-landing/'] },
  })
  for (const entry of result.state.values()) {
    assert.deepEqual(Object.keys(entry).sort(), entry.doc ? ['doc', 'pageInfo', 'vars'] : ['pageInfo', 'vars'])
    assert.deepEqual(Object.keys(entry.pageInfo).sort(), ['outputRelname', 'pageFile', 'url'])
    assert.deepEqual(Object.keys(entry.vars), ['redirectFrom'])
  }
  assert.deepEqual(result.data.runtimeExports.map(d => d.id), ['a', 'b'])
  assert.equal(result.data.navigation.runtime.bySource['a.md'].next?.id, 'b')
  assert.equal(result.data.navigation.runtime.bySource['b.md'].previous?.id, 'a')
  assert.deepEqual(result.data.redirects, [
    { from: '/old-a/', to: a.pageInfo.url }, { from: '/old-landing/', to: landing.pageInfo.url },
  ])
})

test('a delta without previous state falls back to all pages', async () => {
  const pages = [page('a'), page('b'), page('landing', { docsCollection: undefined })]
  await equivalent(pages, delta([pages[1]], ['runtime/docs/deleted.md']))
  counts(pages, [1, 1, 0])
})

test('body upsert reads and renders only one page; empty delta does no body work', async () => {
  const pages = [page('a'), page('b', { order: 1 })]
  const initial = await equivalent(pages, reset)
  clear(pages)
  pages[0].markdown = '# a\n\nChanged body\n'
  pages[0].html = '<h1>a</h1>\n<p>Changed <strong>body</strong></p>'
  const updated = await equivalent(pages, delta([pages[0]]), initial)
  counts(pages, [1, 0])
  // Navigation is the fingerprint input: body-only edits must not change it.
  assert.deepEqual(updated.data.navigation, initial.data.navigation)
  assert.notDeepEqual(updated.data.runtimeExports, initial.data.runtimeExports)
  assert.notDeepEqual(updated.data.runtimeSearch, initial.data.runtimeSearch)
  assert.equal(updated.data.runtimeSearch.items[0].text, 'a Changed body')
  assert.notEqual(updated.state.get(pages[0].sourceId), initial.state.get(pages[0].sourceId))
  assert.equal(updated.state.get(pages[1].sourceId), initial.state.get(pages[1].sourceId))
  clear(pages)
  const empty = await equivalent(pages, delta(), updated)
  counts(pages, [0, 0])
  assert.deepEqual(empty.data, updated.data)
  assert.notEqual(empty.data.navigation.runtime, updated.data.navigation.runtime)
  assert.notEqual(empty.data.navigation.runtime.bySource['a.md'], updated.data.navigation.runtime.bySource['a.md'])
})

test('title, ordering, collection, source path, route and redirect updates replace old memberships', async () => {
  const a = page('a', { redirectFrom: ['/old-a/'] })
  const b = page('b', { order: 1 })
  const c = page('c', { docsCollection: 'silk', order: 2 })
  const pages = [a, b, c]
  let result = await equivalent(pages, reset)
  clear(pages)
  a.vars.title = 'Renamed A'
  result = await equivalent(pages, delta([a]), result)
  counts(pages, [1, 0, 0])
  assert.equal(result.data.runtimeExports[0].title, 'Renamed A')
  assert.equal(result.data.runtimeSearch.items[0].title, 'Renamed A')
  assert.equal(result.data.navigation.runtime.bySource['b.md'].previous?.title, 'Renamed A')

  a.vars.order = 3
  result = await equivalent(pages, delta([a]), result)
  assert.deepEqual(result.data.runtimeExports.map(d => d.id), ['b', 'a'])
  assert.equal(result.data.navigation.runtime.bySource['a.md'].previous?.id, 'b')
  assert.equal(result.data.navigation.runtime.bySource['b.md'].previous, null)

  const oldUrl = a.pageInfo.url
  Object.assign(a.vars, { docsCollection: 'silk', sourcePath: 'guides/renamed.txt', section: 'guides',
    order: 0, redirectFrom: ['/new-alias/'] })
  a.pageInfo = { ...a.pageInfo, url: '/silk/docs/renamed/', outputRelname: 'silk/docs/renamed/index.html' }
  result = await equivalent(pages, delta([a]), result)
  assertAbsent(result.data, 'a.md', 'a', oldUrl)
  assert.deepEqual(result.data.runtimeExports.map(d => d.id), ['b'])
  assert.deepEqual(result.data.runtimeSearch.items.map(d => d.id), ['b'])
  assert.deepEqual(result.data.silkExports.map(d => d.id), ['guides/renamed', 'c'])
  assert.equal(result.data.navigation.runtime.bySource['b.md'].next, null)
  assert.equal(result.data.navigation.silk.bySource['c.md'].previous?.id, 'guides/renamed')
  assert.equal(result.data.navigation.silk.bySource['guides/renamed.txt'].section, 'guides')
  assert.deepEqual(result.data.redirects, [{ from: '/new-alias/', to: a.pageInfo.url }])

  a.vars.redirectFrom = undefined
  result = await equivalent(pages, delta([a]), result)
  assert.deepEqual(result.data.redirects, [])
  a.vars.docsCollection = undefined
  a.pageInfo.type = 'html'
  clear(pages)
  result = await equivalent(pages, delta([a]), result)
  counts(pages, [0, 0, 0])
  assert.equal(result.state.get(a.sourceId)?.doc, undefined)
  assert.equal(result.data.navigation.silk.bySource['guides/renamed.txt'], undefined)
  assert.equal(result.data.navigation.silk.legacy['guides/renamed'], undefined)
  assert.deepEqual(result.data.silkExports.map(d => d.id), ['c'])
  assert.deepEqual(result.data.silkSearch.items.map(d => d.id), ['c'])
  assert.ok(result.data.routes.includes(a.pageInfo.url))
})

test('additions, deletions and reset process the correct pages and discard stale state', async () => {
  const a = page('a', { redirectFrom: ['/old-a/'] })
  const b = page('b')
  const landing = page('landing', { docsCollection: undefined, redirectFrom: ['/landing-alias/'] })
  let result = await equivalent([a], reset)
  clear([a, b, landing])
  result = await equivalent([a, b, landing], delta([b, landing]), result)
  counts([a, b, landing], [0, 1, 0])
  clear([a, b, landing])
  result = await equivalent([b], delta([], [a.sourceId, landing.sourceId, 'already-gone.md']), result)
  counts([a, b, landing], [0, 0, 0])
  assert.deepEqual([...result.state.keys()], [b.sourceId])
  assertAbsent(result.data, 'a.md', 'a', a.pageInfo.url)
  assert.deepEqual(result.data.redirects, [])
  assert.deepEqual(result.data.routes, [b.pageInfo.url])

  const c = page('c', { docsCollection: 'silkWiki' })
  result = await equivalent([b, c], reset, result)
  counts([b, c], [1, 1])
  assert.equal(result.data.silkWikiSearch.kind, 'wiki')
  result = await equivalent([c], reset, result)
  assert.deepEqual([...result.state.keys()], [c.sourceId])
  result = await equivalent([], delta([], [c.sourceId]), result)
  assert.equal(result.state.size, 0)
  assert.deepEqual(result.data.routes, [])
  await equivalent([], reset, result)
})

test('validation failures never stage or mutate successful state, and corrected retries match reset', async t => {
  const cases: { name: string; breakPage: (p: PageDouble) => void; error: RegExp }[] = [
    { name: 'invalid metadata', breakPage: p => { p.vars.order = NaN }, error: /order must be finite/ },
    { name: 'unknown collection', breakPage: p => { p.vars.docsCollection = 'unknown' }, error: /unknown docsCollection/ },
    { name: 'invalid source path', breakPage: p => { p.vars.sourcePath = '../bad.md' }, error: /invalid sourcePath/ },
    { name: 'non-Markdown doc', breakPage: p => { p.pageInfo.type = 'html' }, error: /documentation must be Markdown/ },
    { name: 'duplicate source', breakPage: p => { p.vars.sourcePath = 'a.md' }, error: /Duplicate document:/ },
    { name: 'duplicate id', breakPage: p => { p.vars.sourcePath = 'a.txt' }, error: /Duplicate document id/ },
    { name: 'unsafe redirect', breakPage: p => { p.vars.redirectFrom = ['//unsafe/'] }, error: /Invalid redirectFrom/ },
    { name: 'duplicate redirect', breakPage: p => { p.vars.redirectFrom = ['/old-a/'] }, error: /Duplicate redirectFrom/ },
    { name: 'output collision', breakPage: p => { p.vars.redirectFrom = ['/runtime/docs/a/'] }, error: /collides with existing page/ },
  ]
  for (const scenario of cases) await t.test(scenario.name, async () => {
    const a = page('a', { redirectFrom: ['/old-a/'] })
    const b = page('b', { order: 1 })
    const removed = page('removed')
    const initial = await equivalent([a, b, removed], reset)
    const beforeData = structuredClone(initial.data)
    const changed = copy(a)
    changed.markdown = 'Updated before failure\n'
    changed.html = '<p>Updated before failure</p>'
    const invalid = copy(b)
    scenario.breakPage(invalid)
    for (const changes of [delta([changed, invalid], [removed.sourceId]), reset]) {
      let staged = 0
      await assert.rejects(() => callback({
        pages: [changed, invalid], changes, previousState: initial.state,
        setState() { staged++ },
      }), scenario.error)
      assert.equal(staged, 0)
      assert.deepEqual(initial.state, initial.snapshot)
      assert.deepEqual(structuredClone(initial.data), beforeData)
      assert.ok(initial.state.has(removed.sourceId))
    }
    clear([changed, b])
    const retry = await equivalent([changed, b], delta([changed, b], [removed.sourceId]), initial)
    counts([changed, b], [1, 1])
    assert.equal(retry.state.has(removed.sourceId), false)
    assert.equal(retry.data.runtimeExports[0].markdown, changed.markdown)
  })
})
