import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  access,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { load } from 'cheerio'
import { canonicalLink } from '../src/lib/urls.ts'
import { docUrl } from '../src/lib/collections.ts'
import { markdown } from '../src/lib/markdown.ts'
import { publicContent } from '../tools/migration/content.ts'
import {
  importCollection,
  pageText,
  splitPage,
} from '../tools/import-public.ts'

test('legacy routes and aliases resolve without dropping hashes or unrelated query parameters', () => {
  for (const [input, expected] of [
    ['?p=guides%2Fhello-world#next', '/runtime/docs/guides/hello-world/#next'],
    [
      '?p=start&lang=en#cli-input-forms',
      '/runtime/docs/?lang=en#cli-input-forms',
    ],
    [
      'https://oro.computer/silk/docs/?p=spec/2026#types',
      '/silk/spec/2026/#types',
    ],
    ['../llms.txt', '/runtime/llms.txt'],
    ['https://example.com/?p=start', 'https://example.com/?p=start'],
  ])
    assert.equal(canonicalLink(input, '/runtime/docs/'), expected)
  assert.equal(
    docUrl('silk', 'guides/toy-logger-module.md'),
    '/silk/docs/guides/practical-logger-module/',
  )
  assert.equal(
    canonicalLink('../types.md#syntax', '/silk/docs/', 'language/sub/page.md'),
    '/silk/docs/language/types/#syntax',
  )
})

test('public-copy normalization preserves fenced examples and literal double braces', () => {
  const code =
    '// Works today: do not rewrite this comment\nconst value = "{{ literal }}";\n'
  for (const fence of ['```', '````', '~~~']) {
    const source =
      '# Example\n\nWorks today: a demonstration.\n\n' +
      fence +
      'js\n' +
      code +
      fence +
      '\n'
    const result = publicContent(source, 'runtime', 'guides/example.md')
    assert.ok(result.includes(code))
    assert.ok(!result.includes('Works today: a demonstration.'))
    assert.equal(load(markdown().render(result))('pre code').text(), code)
  }
})

test('heading anchors preserve punctuation, Unicode and duplicate suffixes', () => {
  const $ = load(
    markdown().render(
      '# A\n\n## `oro:fs` API\n\n## `oro:fs` API\n\n## Café & tea\n',
    ),
  )
  assert.deepEqual(
    $('h2')
      .map((_i, e) => $(e).attr('id'))
      .get(),
    ['orofs-api', 'orofs-api-1', 'café--tea'],
  )
})

test('staged imports preserve metadata and ownership boundaries and prune removed imported pages', async () => {
  const site = await mkdtemp(join(tmpdir(), 'oro-import-test-'))
  try {
    const page = join(site, 'src/silk/docs/language/example/page.md')
    const stale = join(site, 'src/silk/docs/language/stale/page.md')
    const wiki = join(site, 'src/silk/wiki/page.md')
    const metadata = {
      layout: 'docs',
      title: 'Old',
      description: 'Old',
      docsCollection: 'silk',
      section: 'language',
      order: 42,
      sourcePath: 'language/example.md',
      githubRepo: 'oro-computer/silk',
      githubRef: 'master',
    }
    for (const [path, meta] of [
      [page, metadata],
      [stale, { ...metadata, sourcePath: 'language/stale.md' }],
      [
        wiki,
        { ...metadata, docsCollection: 'silkWiki', sourcePath: 'start.md' },
      ],
    ] as const) {
      await mkdir(join(path, '..'), { recursive: true })
      await writeFile(path, pageText(meta, '# Old\n'))
    }
    const staged = join(site, 'staged')
    await mkdir(join(staged, 'language'), { recursive: true })
    await writeFile(
      join(staged, 'language/example.md'),
      '# New title\n\nA public description.\n\n[Start](?p=start)\n',
    )
    await importCollection('silk', staged, site)
    const { metadata: next, body } = splitPage(await readFile(page, 'utf8'))
    assert.equal(next.order, 42)
    assert.equal(next.section, 'language')
    assert.equal(next.title, 'New title')
    assert.ok(body.includes('(/silk/docs/)'))
    await assert.rejects(access(stale))
    await access(wiki)
    const before = await readFile(page, 'utf8')
    await importCollection('silk', staged, site)
    assert.equal(await readFile(page, 'utf8'), before)
  } finally {
    await rm(site, { recursive: true, force: true })
  }
})
test('fence protection handles longer closing delimiters and indented code', () => {
  for (const source of [
    '```js\n// Works today\nconst t = "{{ foo }}"\n````\n',
    '    // Works today\n    {{ foo }}\n',
  ])
    assert.equal(publicContent(source, 'silk', 'language/example.md'), source)
})
test('public reference links are idempotent and leave existing links and fences intact', async () => {
  const { linkReferences } = await import('../tools/migration/references.ts')
  const catalog = [
    { collection: 'silk' as const, id: 'std/io', title: '`std::io`' },
  ]
  const source =
    'Use `std::io` and `src/main.zig`.\n\n```silk\n// `std::io`\n```\n'
  const result = linkReferences(source, 'silk', 'start.md', catalog)
  assert.ok(result.includes('[`std::io`](/silk/docs/std/io/)'))
  assert.ok(
    result.includes(
      'https://github.com/oro-computer/silk/blob/master/src/main.zig',
    ),
  )
  assert.ok(result.includes('```silk\n// `std::io`\n```'))
  assert.equal(linkReferences(result, 'silk', 'start.md', catalog), result)
})
test('absolute raw Markdown URLs resolve across collections and keep fragments', () => {
  assert.equal(
    canonicalLink(
      'https://oro.computer/silk/docs/source/std/io.md#examples',
      '/runtime/docs/',
    ),
    '/silk/docs/std/io/#examples',
  )
  assert.equal(
    canonicalLink('/silk/wiki/source/start.md', '/runtime/docs/'),
    '/silk/wiki/',
  )
  assert.equal(
    canonicalLink('../docs/start.md', '/runtime/docs/', 'start.md'),
    '/runtime/docs/',
  )
})
test('refreshed linked API headings produce plain titles and new pages can reference each other', async () => {
  const site = await mkdtemp(join(tmpdir(), 'oro-import-headings-'))
  try {
    await mkdir(join(site, 'src'), { recursive: true })
    const stage = join(site, 'staged/std')
    await mkdir(stage, { recursive: true })
    await writeFile(
      join(stage, 'alpha.md'),
      '# [`std::alpha`](/silk/docs/std/alpha/)\n\nUse `std::beta`.\n',
    )
    await writeFile(
      join(stage, 'beta.md'),
      '# `std::beta`\n\nUse `std::alpha`.\n',
    )
    await importCollection('silk', join(site, 'staged'), site)
    const file = join(site, 'src/silk/docs/std/alpha/page.md')
    const first = await readFile(file, 'utf8')
    assert.equal(splitPage(first).metadata.title, 'std::alpha')
    assert.ok(first.includes('[`std::beta`](/silk/docs/std/beta/)'))
    await importCollection('silk', join(site, 'staged'), site)
    assert.equal(await readFile(file, 'utf8'), first)
  } finally {
    await rm(site, { recursive: true, force: true })
  }
})
