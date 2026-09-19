import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { load } from 'js-yaml'
import { createPost, parseCreateArgs } from '../tools/blog/create.ts'
import { publishDraft } from '../tools/blog/publish.ts'

const now = new Date('2026-06-15T12:00:00.000Z')
async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const blogDir = await mkdtemp(join(tmpdir(), 'oro-blog-tools-'))
  t.after(() => rm(blogDir, { recursive: true, force: true }))
  return { blogDir, now }
}

test('create scaffolds a dated draft, one heading, and colocated images', async t => {
  const options = await fixture(t)
  const draft = await createPost('Hello Runtime', options)
  assert.equal(draft, join(options.blogDir, '2026/hello-runtime/page.draft.md'))
  const content = await readFile(draft, 'utf8')
  assert.match(content, /layout: blog\n/)
  assert.match(content, /description: "A short summary of this post\."/)
  assert.match(content, /publishDate: "2026-06-15T12:00:00.000Z"/)
  assert.equal(content.match(/^# Hello Runtime$/gm)?.length, 1)
  assert.doesNotMatch(content, /^title:/m)
    assert.match(content, /^author: oro$/m)
  assert.match(content, /Draft: replace/)
  assert.deepEqual(await readdir(dirname(draft)), ['img', 'page.draft.md'])
})

test('publish supports explicit older years, preserves body and metadata, and updates date', async t => {
  const options = await fixture(t)
  const draft = await createPost('Older Post', { ...options, now: new Date('2025-06-15T12:00:00Z') })
  const body = '\r\n# Older Post\r\n\r\npublishDate: "leave body alone"\r\n---\r\nText without final newline'
  await writeFile(draft, `---\r\nlayout: blog\r\ndescription: Summary\r\nauthor: joe\r\ntags: [runtime, news]\r\npublishDate: '2025-06-15'\r\n---\r\n${body}`)
  await assert.rejects(publishDraft('older-post', options), { code: 'ENOENT' })
  const published = await publishDraft('2025/older-post', options)
  const content = await readFile(published, 'utf8')
  const end = content.indexOf('\r\n---\r\n', 5)
  assert.equal(content.slice(end + 7), body)
  assert.deepEqual(load(content.slice(5, end)), {
    layout: 'blog', description: 'Summary', author: 'joe', tags: ['runtime', 'news'], publishDate: now.toISOString(),
  })
  assert.deepEqual(await readdir(dirname(published)), ['img', 'page.md'])
})

test('create and publish never clobber drafts or published files, including concurrent publish', async t => {
  const options = await fixture(t)
  const draft = await createPost('Existing Post', options)
  const original = await readFile(draft, 'utf8')
  await assert.rejects(createPost('Existing Post', options), { code: 'EEXIST' })
  assert.equal(await readFile(draft, 'utf8'), original)
  const published = join(dirname(draft), 'page.md')
  await writeFile(published, 'Existing publication')
  await assert.rejects(publishDraft('existing-post', options), /already exists/)
  assert.equal(await readFile(published, 'utf8'), 'Existing publication')
  assert.equal(await readFile(draft, 'utf8'), original)
  await rm(published)
  const results = await Promise.allSettled([publishDraft('existing-post', options), publishDraft('existing-post', options)])
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1)
  const result = await readFile(published, 'utf8')
  assert.deepEqual(load(result.split('---\n')[1]!), load(original.split('---\n')[1]!))
  assert.equal(result.slice(result.indexOf('\n---\n') + 5), original.slice(original.indexOf('\n---\n') + 5))
  await assert.rejects(createPost('Existing Post', options), { code: 'EEXIST' })
  assert.deepEqual(await readdir(dirname(draft)), ['img', 'page.md'])
})

test('invalid paths, symlinks, titles, and malformed metadata fail without publishing', async t => {
  const options = await fixture(t)
  for (const input of ['../escape', '/absolute', '2025/../escape', '2025/foo/bar', 'foo\\bar', '.', '', 'UPPER']) {
    await assert.rejects(publishDraft(input, options), /lowercase slug/)
  }
  for (const title of ['', '!!!', 'title\nlayout: other']) await assert.rejects(createPost(title, options))
  assert.deepEqual(await readdir(options.blogDir), [])
  await symlink(options.blogDir, join(options.blogDir, '2026'))
  await assert.rejects(createPost('Symlink', options), /symbolic links/)
  await rm(join(options.blogDir, '2026'))
  const draft = await createPost('Invalid Metadata', options)
  for (const content of ['No frontmatter', '---\n[]\n---\nBody', '---\ninvalid: [\n---\nBody']) {
    await writeFile(draft, content)
    await assert.rejects(publishDraft('invalid-metadata', options), /frontmatter/)
    assert.equal(await readFile(draft, 'utf8'), content)
    assert.deepEqual(await readdir(dirname(draft)), ['img', 'page.draft.md'])
  }
})

test('explicit authors are validated, scaffolded, and retained on publication', async t => {
  const options = await fixture(t)
  for (const author of ['bret', 'joe', 'oro'] as const) {
    const args = parseCreateArgs([`Post ${author}`, '--author', author])
    assert.deepEqual(args, { help: false, title: `Post ${author}`, author })
    if (args.help) throw new Error('Expected create arguments')
    const draft = await createPost(args.title, { ...options, author: args.author })
    assert.match(await readFile(draft, 'utf8'), new RegExp(`^author: ${author}$`, 'm'))
    const published = await publishDraft(`post-${author}`, options)
    const metadata = load((await readFile(published, 'utf8')).split('---\n')[1]!) as { author: string }
    assert.equal(metadata.author, author)
  }
  assert.deepEqual(parseCreateArgs(['Default Post']), { help: false, title: 'Default Post', author: 'oro' })
  assert.deepEqual(parseCreateArgs(['--author=bret', 'Named Post']), { help: false, title: 'Named Post', author: 'bret' })
  assert.throws(() => parseCreateArgs(['--author', 'unknown', 'Post']), /unknown author/)
  assert.throws(() => parseCreateArgs(['Post', '--author']), /Usage:/)
  // Runtime callers must be validated too, even if they bypass TypeScript.
  // @ts-expect-error Deliberately invalid author ID.
  await assert.rejects(createPost('Unknown Author', { ...options, author: 'unknown' }), /unknown author/)
  assert.deepEqual(await readdir(join(options.blogDir, '2026')), ['post-bret', 'post-joe', 'post-oro'])
})

test('year selection follows UTC at the year boundary', async t => {
  const options = { ...await fixture(t), now: new Date('2025-12-31T23:30:00-02:00') }
  const draft = await createPost('New Year', options)
  assert.equal(draft, join(options.blogDir, '2026/new-year/page.draft.md'))
  const published = await publishDraft('new-year', options)
  assert.match(await readFile(published, 'utf8'), /2026-01-01T01:30:00.000Z/)
})

test('CLIs show successful help and reject missing or extra arguments', () => {
  for (const script of ['create', 'publish']) {
    const file = fileURLToPath(new URL(`../tools/blog/${script}.ts`, import.meta.url))
    const help = spawnSync(process.execPath, [file, '--help'], { encoding: 'utf8' })
    assert.equal(help.status, 0)
    assert.match(help.stdout, /Usage: npm run/)
    assert.equal(help.stderr, '')
    for (const args of [[], ['one', 'two'], ['--unknown']]) {
      const result = spawnSync(process.execPath, [file, ...args], { encoding: 'utf8' })
      assert.equal(result.status, 1)
      assert.match(result.stderr, /Error: Usage:/)
    }
  }
})
