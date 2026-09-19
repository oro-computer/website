import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collectRedirects, redirectOutputName, type RedirectPage } from '#lib/redirects.ts'

function page(redirectFrom: unknown, source = 'current/page.md', url = '/current/'): RedirectPage {
  return { vars: { redirectFrom }, pageInfo: { url, pageFile: { relname: source } } }
}

test('maps root, directory, and file aliases without rewriting escaped names', () => {
  for (const [from, output] of [
    ['/', 'index.html'], ['/old/', 'old/index.html'], ['/old/index.html', 'old/index.html'],
    ['/old.html', 'old.html'], ['/old', 'old'], ['/caf%C3%A9/', 'caf%C3%A9/index.html'],
    ['/a&b.html', 'a&b.html'],
  ]) assert.equal(redirectOutputName(from), output)
})

test('accepts absent or empty metadata and any source-backed page structure', () => {
  assert.deepEqual(collectRedirects([]), [])
  assert.deepEqual(collectRedirects([page(undefined), page([])]), [])
  for (const source of ['current/page.html', 'current/page.md', 'current/page.ts']) {
    assert.deepEqual(collectRedirects([page(['/old/'], source)]), [{ from: '/old/', to: '/current/', source }])
  }
})

test('projects deterministic JSON-safe metadata independently of page bodies', () => {
  const first = page(['/z/', '/a/'])
  const second = page(['/b.html'], 'other.md', '/other.html')
  const expected = [
    { from: '/a/', to: '/current/', source: 'current/page.md' },
    { from: '/b.html', to: '/other.html', source: 'other.md' },
    { from: '/z/', to: '/current/', source: 'current/page.md' },
  ]
  assert.deepEqual(collectRedirects([first, second]), expected)
  const changed = { ...first, vars: { redirectFrom: ['/a/', '/z/'], title: 'Changed', ignored: 1n },
    get body(): never { throw new Error('Body must not be read') } }
  assert.deepEqual(JSON.parse(JSON.stringify(collectRedirects([second, changed]))), expected)
  assert.deepEqual(first.vars.redirectFrom, ['/z/', '/a/'])
})

test('rejects non-array metadata and non-string entries with source context', () => {
  for (const value of [null, false, '/old/', {}, 1, [null], [1], ['/ok/', {}], Array(1)]) {
    assert.throws(() => collectRedirects([page(value)]), error => {
      assert.ok(error instanceof TypeError)
      assert.match(error.message, /redirectFrom.*current\/page.md.*(?:array|strings)/)
      return true
    })
  }
})

test('rejects unsafe paths in both exports, reporting the declaring source', () => {
  for (const from of [
    '', 'old/', '//example.com/', 'https://example.com/', '/old path/', '/old\t/',
    '/old\n/', '/old\0/', '/old\u007f/', '/old\u0085/', '/old\u00a0/',
    '/old?query', '/old#hash', '/old\\path', '/./old', '/old/../new',
    '/%2e/', '/old/%2E%2e/new', '/.%2e/', '/%252e%252e/',
    '/old%2fnew/', '/old%5Cnew/', '/%252f/', '/%20/', '/%0a/',
    '/%3f/', '/%23/', '/%00/', '/old//new/', '/%', '/%zz/', '/%C0%AF/',
  ]) {
    assert.throws(() => redirectOutputName(from), /Invalid redirectFrom/, from)
    assert.throws(() => collectRedirects([page([from])]), /Invalid redirectFrom.*current\/page.md/, from)
  }
})

test('rejects duplicate aliases, including equivalent output spellings', () => {
  for (const aliases of [
    ['/old/', '/old/'], ['/old/', '/old/index.html'], ['/', '/index.html'],
    ['/old/', '/%6fld/'], ['/caf%C3%A9/', '/café/'],
  ]) assert.throws(() => collectRedirects([page(aliases)]), /Duplicate redirectFrom.*current\/page.md/)
  assert.throws(() => collectRedirects([
    page(['/old/'], 'first.md', '/first/'), page(['/old/index.html'], 'second.html', '/second/'),
  ]), /Duplicate redirectFrom.*second.html.*first.md/)
})

test('rejects self and existing-page collisions regardless of input order', () => {
  for (const alias of ['/current/', '/current/index.html', '/%63urrent/']) {
    assert.throws(() => collectRedirects([page([alias])]), /collides with existing page.*current\/page.md/)
  }
  const owner = page(['/taken/'])
  const existing = page(undefined, 'taken/page.html', '/taken/')
  for (const pages of [[owner, existing], [existing, owner]]) {
    assert.throws(() => collectRedirects(pages), /current\/page.md.*collides with existing page.*taken\/page.html/)
  }
  assert.throws(() => collectRedirects([page(['/']), page(undefined, 'page.html', '/')]), /collides/)
})

test('uses actual outputRelname when provided, including literal Unicode names', () => {
  const existing = page(undefined, 'special/page.html', '/different-public-url/')
  existing.pageInfo.outputRelname = 'café/index.html'
  assert.throws(() => collectRedirects([page(['/caf%C3%A9/']), existing]), /collides.*special\/page.html/)
  existing.pageInfo.outputRelname = 'caf%C3%A9/index.html'
  assert.throws(() => collectRedirects([page(['/caf%C3%A9/']), existing]), /collides.*special\/page.html/)
  assert.deepEqual(collectRedirects([page(['/different-public-url/']), existing]), [
    { from: '/different-public-url/', to: '/current/', source: 'current/page.md' },
  ])
})

test('preserves target URLs and aliases as data, without HTML escaping', () => {
  assert.deepEqual(collectRedirects([page(['/old&name.html'], 'quoted"source.md', '/new&name.html')]), [
    { from: '/old&name.html', to: '/new&name.html', source: 'quoted"source.md' },
  ])
  assert.throws(() => collectRedirects([page(['bad'], 'quoted"source.md')]), error => {
    assert.ok(error instanceof Error)
    assert.ok(error.message.includes(JSON.stringify('quoted"source.md')))
    return true
  })
})
