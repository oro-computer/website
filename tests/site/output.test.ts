import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { load } from 'cheerio'
import { splitPage } from '../../tools/import-public.ts'
import { collections } from '../../src/lib/collections.ts'
const baseline = JSON.parse(
  await readFile('tools/migration/baseline.json', 'utf8'),
)
test('all original routes and documents have static HTML and unchanged raw endpoints', async () => {
  assert.equal(baseline.documents.length, 585)
  assert.equal(baseline.html.length, 27)
  for (const route of baseline.html)
    await access('public' + route + 'index.html')
  for (const doc of baseline.documents) {
    const html = await readFile('public' + doc.url + 'index.html', 'utf8')
    const $ = load(html)
    assert.ok($('.prose h1').text(), doc.url)
    assert.ok($('meta[name="description"]').attr('content'), doc.url)
    assert.equal(
      $('link[rel="canonical"]').attr('href'),
      'https://oro.computer' + doc.url,
    )
    const raw = await readFile('public' + doc.source, 'utf8')
    const { body } = splitPage(
      await readFile('src' + doc.url + 'page.md', 'utf8'),
    )
    assert.equal(raw.trim(), body.trim(), doc.source)
  }
})
test('search and LLM packs contain the public article content', async () => {
  for (const [key, c] of Object.entries(collections)) {
    const search = JSON.parse(
      await readFile('public' + c.base + 'search.json', 'utf8'),
    )
    const pack = await readFile('public/' + c.product + '/llms.txt', 'utf8')
    for (const item of search.items) {
      const raw = await readFile(
        'public' + c.base + 'source/' + item.file,
        'utf8',
      )
      assert.ok(pack.includes(raw), `${key}:${item.id}`)
      const $ = load(await readFile('public' + item.url + 'index.html', 'utf8'))
      $('.docs-heading-anchor').remove()
      assert.equal(
        item.text,
        $('.prose').text().replace(/\s+/g, ' ').trim(),
        item.id,
      )
    }
  }
})
test('literal API double braces survive the actual DOMStack build', async () => {
  const $ = load(
    await readFile('public/runtime/docs/javascript/toml/index.html', 'utf8'),
  )
  assert.ok(
    $('.prose pre code')
      .text()
      .includes(
        '@param {{ reviver?: (key: string, value: unknown) => unknown }}',
      ),
  )
})
test('public branding assets match the canonical originals', async () => {
  for (const file of [
    'logo-icon-small.png',
    'logo-icon.png',
    'logo-full.png',
    'logo-small.png',
  ]) {
    assert.deepEqual(
      await readFile('public/docs/branding/assets/' + file),
      await readFile('docs/branding/assets/' + file),
    )
  }
  for (const file of ['CNAME', '.nojekyll']) await access('public/' + file)
})
test('every legacy document ID resolves to its recorded canonical route', async () => {
  const { legacyTarget } = await import('../../src/lib/legacy.ts')
  for (const key of Object.keys(collections)) {
    const docs = baseline.documents.filter((d: any) => d.collection === key)
    const map = Object.fromEntries(docs.map((d: any) => [d.id, d.url]))
    for (const doc of docs) {
      assert.equal(legacyTarget(doc.id, map), doc.url)
      assert.equal(legacyTarget('./' + doc.id + '.md', map), doc.url)
    }
    assert.equal(legacyTarget('constructor', map), undefined)
  }
})
