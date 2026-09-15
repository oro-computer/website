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
import { canonicalLink } from '#lib/urls.ts'
import { docUrl } from '#lib/collections.ts'
import { markdown } from '#lib/markdown.ts'
import { titleFromMarkdown } from '#lib/titles.ts'
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
    assert.equal(Object.hasOwn(next, 'title'), false)
    assert.equal(titleFromMarkdown(body), 'New title')
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
test('imports preserve explicit overrides, infer changed headings, and fall back without H1', async () => {
  const site = await mkdtemp(join(tmpdir(), 'oro-import-titles-'))
  try {
    const stage = join(site, 'staged')
    await mkdir(stage, { recursive: true })
    await mkdir(join(site, 'src'), { recursive: true })
    await writeFile(join(stage, 'example.md'), '# First\n')
    await writeFile(join(stage, 'fallback.md'), 'No heading.\n')
    await importCollection('silk', stage, site)
    const file = join(site, 'src/silk/docs/example/page.md')
    const fallback = splitPage(await readFile(join(site, 'src/silk/docs/fallback/page.md'), 'utf8'))
    assert.equal(fallback.metadata.title, 'fallback')
    await writeFile(join(stage, 'example.md'), '# [`Second`](/silk/docs/example/)\n')
    await importCollection('silk', stage, site)
    const inferred = splitPage(await readFile(file, 'utf8'))
    assert.equal(Object.hasOwn(inferred.metadata, 'title'), false)
    assert.equal(titleFromMarkdown(inferred.body), 'Second')
    await writeFile(file, pageText({ ...inferred.metadata, title: 'Editorial `override`', redirectFrom: ['/old/'] }, inferred.body))
    await writeFile(join(stage, 'example.md'), '# Third\n')
    await importCollection('silk', stage, site)
    const overridden = splitPage(await readFile(file, 'utf8'))
    assert.equal(overridden.metadata.title, 'Editorial `override`')
    assert.deepEqual(overridden.metadata.redirectFrom, ['/old/'])
    assert.equal(titleFromMarkdown(overridden.body), 'Third')
    for (const title of ['', '   ', null, 42]) {
      const invalid = pageText({ ...overridden.metadata, title }, overridden.body)
      await writeFile(file, invalid)
      await assert.rejects(importCollection('silk', stage, site), /Invalid explicit title/)
      assert.equal(await readFile(file, 'utf8'), invalid)
    }
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
    const wiki = join(site, 'src/silk/wiki/page.md')
    await mkdir(join(wiki, '..'), { recursive: true })
    await writeFile(wiki, pageText({ docsCollection: 'silkWiki', sourcePath: 'start.md' }, '# [`Wiki API`](/silk/wiki/)\n'))
    const stage = join(site, 'staged/std')
    await mkdir(stage, { recursive: true })
    await writeFile(
      join(stage, 'alpha.md'),
      '# [`std::alpha`](/silk/docs/std/alpha/)\n\nUse `std::beta`.\n',
    )
    await writeFile(
      join(stage, 'beta.md'),
      '# `std::beta`\n\nUse `std::alpha` and `Wiki API`.\n',
    )
    await importCollection('silk', join(site, 'staged'), site)
    const file = join(site, 'src/silk/docs/std/alpha/page.md')
    const first = await readFile(file, 'utf8')
    assert.equal(Object.hasOwn(splitPage(first).metadata, 'title'), false)
    assert.equal(titleFromMarkdown(splitPage(first).body), 'std::alpha')
    assert.ok(first.includes('[`std::beta`](/silk/docs/std/beta/)'))
    assert.ok((await readFile(join(site, 'src/silk/docs/std/beta/page.md'), 'utf8')).includes('[`Wiki API`](/silk/wiki/)'))
    await importCollection('silk', join(site, 'staged'), site)
    assert.equal(await readFile(file, 'utf8'), first)
  } finally {
    await rm(site, { recursive: true, force: true })
  }
})
