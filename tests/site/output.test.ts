import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { identifyPages } from '@domstack/static/lib/identify-pages.js'
import { buildPagesDirect } from '@domstack/static/lib/build-pages/index.js'
import { load } from 'cheerio'
import { splitPage } from '../../tools/import-public.ts'
import { collections } from '#lib/collections.ts'
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
test('docs and spec page outputs preserve raw bytes and nested .txt filenames', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'oro-page-outputs-'))
  const src = join(fixture, 'src')
  const dest = join(fixture, 'public')
  try {
    for (const name of ['globals/global.data.ts', 'globals/global.vars.ts', 'markdown-it.settings.ts', 'layouts/root.layout.ts', 'layouts/docs.layout.ts', 'layouts/spec.layout.ts']) {
      const target = join(src, name)
      const url = new URL('../../src/' + name, import.meta.url).href
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, `export { default } from ${JSON.stringify(url)}\nexport * from ${JSON.stringify(url)}\n`)
    }
    const body = '\n\n# Exact bytes\r\n\r\nUnicode: café — λ.  \r\n\n---\n\n{{ untouched }}\n\n'
    for (const layout of ['docs', 'spec']) {
      const target = join(src, 'silk', layout, 'bytes', 'page.md')
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, `---\nlayout: "${layout}"\ntitle: "Exact bytes"\ndescription: "Summary"\ndocsCollection: "silk"\nsection: "spec"\norder: 0\nsourcePath: "${layout}/bytes.txt"\ngithubRepo: "oro-computer/silk"\ngithubRef: "master"\n---` + body)
    }
    const siteData = await identifyPages(src)
    assert.deepEqual(siteData.errors, [])
    const result = await buildPagesDirect(src, dest, siteData)
    assert.deepEqual(result.errors, [])
    for (const layout of ['docs', 'spec']) {
      await access(join(dest, 'silk', layout, 'bytes', 'index.html'))
      assert.deepEqual(
        await readFile(join(dest, 'silk/docs/source', layout, 'bytes.txt')),
        Buffer.from(body),
        layout,
      )
    }
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
})
test('search and LLM packs contain the public article content', async () => {
  for (const [key, c] of Object.entries(collections)) {
    await assert.rejects(access('public' + c.base + 'index.json'), { code: 'ENOENT' })
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
  const { legacyTarget } = await import('#lib/legacy.ts')
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
