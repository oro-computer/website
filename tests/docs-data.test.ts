import { test } from 'node:test'
import assert from 'node:assert/strict'
import { projectCollection, validateDocVars, editUrl, type Doc } from '../src/lib/docs.ts'
import { collectionIndex, pack, sitemap } from '../src/lib/artifacts.ts'
import { article, rootContent } from '../src/lib/rendering.ts'
import { markdown } from '../src/lib/markdown.ts'
const doc: Doc = {
  collection: 'runtime', id: 'start', title: 'Start', description: 'Summary',
  section: 'overview', order: 0, sourcePath: 'start.md', url: '/runtime/docs/',
  githubRepo: 'oro-computer/runtime', githubRef: 'master', editUrl: editUrl('runtime/docs/page.md'),
  markdown: '# Start\n', searchText: 'Start',
}
test('navigation is JSON-safe, precomputed, and independent of body/search changes', () => {
  const second = { ...doc, id: 'next', sourcePath: 'next.txt', title: 'Next', url: '/runtime/docs/next/' }
  const nav = projectCollection([doc, second])
  assert.equal(nav.bySource['start.md'].previous, null)
  assert.equal(nav.bySource['start.md'].next?.title, 'Next')
  assert.equal(nav.bySource['next.txt'].previous?.id, 'start')
  assert.equal(nav.bySource['next.txt'].next, null)
  assert.equal(nav.sections[0].title, 'Start')
  assert.equal(nav.legacy.start, doc.url)
  assert.equal(JSON.stringify(nav), JSON.stringify(projectCollection([{ ...doc, markdown: 'Changed', searchText: 'Changed', description: 'Changed' }, second])))
  assert.deepEqual(JSON.parse(JSON.stringify(nav)).bySource['start.md'], { ...nav.bySource['start.md'] })
  assert.throws(() => projectCollection([doc, doc]), /Duplicate document/)
  const index = JSON.parse(collectionIndex('runtime', nav).content)
  assert.equal(index.sections[0].items[1].file, 'next.txt')
})
test('navigation rejects legacy ID collisions between Markdown and text sources', () => {
  const first = { ...doc, id: 'foo', sourcePath: 'foo.md' }
  const second = { ...doc, id: 'foo', sourcePath: 'foo.txt', url: '/runtime/docs/other/' }
  assert.throws(() => projectCollection([first, second]), {
    message: 'Duplicate document id "foo" in collection "runtime": foo.md and foo.txt',
  })
})
test('source validation rejects malformed collection metadata with source context', () => {
  const vars = { ...doc, docsCollection: doc.collection }
  assert.equal(validateDocVars(vars, 'runtime/docs/page.md').title, 'Start')
  for (const change of [{ docsCollection: 'invalid' }, { order: NaN }, { title: 4 }, { sourcePath: '../secret.md' }, { sourcePath: '/start.md' }])
    assert.throws(() => validateDocVars({ ...vars, ...change }, 'runtime/docs/page.md'), /runtime\/docs\/page.md/)
  assert.equal(editUrl('silk/docs/renamed/README.md'), 'https://github.com/oro-computer/website/blob/master/src/silk/docs/renamed/README.md')
})
test('artifact URLs use site configuration and sitemap escapes XML', () => {
  assert.match(pack('runtime', [doc], 'https://preview.example').content, /URL: https:\/\/preview.example\/runtime\/docs\//)
  const xml = sitemap(['/page/?a=1&b=2'], 'https://preview.example').content
  assert.ok(xml.includes('https://preview.example/page/?a=1&amp;b=2'))
})
test('article enhancement is page-local and preserves legacy anchors', () => {
  const md = markdown()
  const source = '## `oro:fs` API\n\n## `oro:fs` API\n\n> [!NOTE]\n> Alert\n'
  const rendered = md.render(source)
  assert.equal(md.render(source), rendered)
  const result = article(rendered)
  assert.ok(result.body.includes('id="orofs-api-1"'))
  assert.ok(result.toc.includes('href="#orofs-api-1"'))
  assert.ok(rendered.includes('markdown-alert'))
  assert.equal(article(rendered).body, result.body)
  assert.ok(article(rendered, true).toc.includes('spec-toc'))
  assert.equal(rootContent('<p>Unchanged</p>'), '<p>Unchanged</p>')
  assert.ok(rootContent('<pre><code class="language-js">const x = 1</code></pre>').includes('hljs-keyword'))
})
