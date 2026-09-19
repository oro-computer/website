import test from 'node:test'
import assert from 'node:assert/strict'
import { load } from 'cheerio'
import { blogDate, formatBlogDate, projectBlog, readBlogPost, validateBlogVars, type BlogPage, type BlogPost } from '#lib/blog.ts'
import { atomFeed, feedHtml, jsonFeed } from '#lib/blog-feeds.ts'
import { resolveBlogAuthor } from '#lib/authors.ts'
import blogPage, { vars as indexVars } from '../src/blog/page.ts'
import blogLayout from '../src/layouts/blog-index.layout.ts'
import postLayout from '../src/layouts/blog.layout.ts'
import { dataDeps as jsonDeps } from '../src/feed.json.template.ts'
import { dataDeps as atomDeps } from '../src/feed.xml.template.ts'

const site = 'https://oro.computer'
const metadata = { title: '**Hello** &amp; `Oro`', description: 'A real description', publishDate: '2026-01-02T00:30:00+02:00' }
const sample = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  url: '/blog/hello/', title: 'Hello & <Oro>', description: 'Quotes " & <tags>',
  publishDate: '2026-01-01T22:30:00.000Z', authorName: 'Oro & Friends',
  html: '<h1>Hello</h1><p>Full body &amp; more.</p>', ...overrides,
})
const page = (overrides: Partial<BlogPage> = {}): BlogPage => ({
  sourceId: 'blog/hello/page.md', vars: metadata, pageInfo: { url: '/blog/hello/', type: 'md' },
  renderInnerPage: async () => '<h1>Hello &amp; Oro</h1><p>Complete body</p>', ...overrides,
})

test('readBlogPost normalizes inferred titles and dates and returns a cloneable inner-body projection', async () => {
  const post = await readBlogPost(page())
  assert.equal(post.title, 'Hello & Oro')
  assert.equal(post.publishDate, '2026-01-01T22:30:00.000Z')
  assert.equal(post.authorName, 'Oro Computer')
  assert.equal(post.authorUrl, site)
  assert.match(post.html, /Complete body/)
  assert.deepEqual(structuredClone(post), post)
  assert.equal(formatBlogDate(post.publishDate), 'January 1, 2026')
  await assert.rejects(readBlogPost(page({ pageInfo: { url: '/blog/hello/', type: 'html' } })), /must be Markdown/)
})

test('author registry defaults to Oro and rejects unknown or malformed IDs', () => {
  assert.deepEqual(resolveBlogAuthor(undefined, 'sample'), { id: 'oro', name: 'Oro Computer', url: site })
  assert.deepEqual(resolveBlogAuthor('oro', 'sample'), resolveBlogAuthor(undefined, 'sample'))
  for (const value of ['unknown', '', 'Joe', ' joe ', 'toString', '__proto__', null, 1, {}]) {
    assert.throws(() => resolveBlogAuthor(value, 'sample'), /sample: unknown author/)
  }
  const resolved = validateBlogVars({ ...metadata, author: 'joe', authorName: 'Not a registry author' }, 'sample')
  assert.equal(resolved.authorName, 'Joseph Werle')
})

test('Joe and Bret profiles propagate through projections, linked bylines and both feeds', async () => {
  for (const author of [
    { id: 'joe', name: 'Joseph Werle', url: 'https://github.com/jwerle' },
    { id: 'bret', name: 'Bret Comnes', url: 'https://bret.io' },
  ] as const) {
    assert.deepEqual(resolveBlogAuthor(author.id, 'sample'), author)
    const vars = { ...metadata, author: author.id }
    const post = await readBlogPost(page({ vars }))
    assert.equal(post.authorName, author.name)
    assert.equal(post.authorUrl, author.url)
    assert.equal(projectBlog([post]).blogPosts[0].authorUrl, author.url)
    const output = await postLayout({ vars, children: post.html, page: { url: post.url } as never, data: {} })
    const byline = load(output)('.blog-byline a[rel="author"]')
    assert.equal(byline.text(), author.name)
    assert.equal(byline.attr('href'), author.url)
    assert.deepEqual(JSON.parse(jsonFeed([post], site)).items[0].authors, [{ name: author.name, url: author.url }])
    const atom = load(atomFeed([post], site), { xml: true })
    assert.equal(atom('author > name').text(), author.name)
    assert.equal(atom('author > uri').text(), author.url)
  }
})

test('Atom escapes optional author URLs and omits absent profile URIs', () => {
  const authorUrl = 'https://example.com/?a=1&b=2'
  const xml = atomFeed([sample({ authorUrl })], site)
  assert.match(xml, /<uri>https:\/\/example\.com\/\?a=1&amp;b=2<\/uri>/)
  assert.equal(load(xml, { xml: true })('author > uri').text(), authorUrl)
  assert.equal(load(atomFeed([sample()], site), { xml: true })('author > uri').length, 0)
})

test('metadata rejects missing text, ambiguous dates, invalid calendar dates and backwards updates', () => {
  for (const invalid of ['', '2026-01-01', '2026-01-01T00:00:00', '2026-02-29T00:00:00Z', '2026-04-31T00:00:00Z', '2026-01-01T24:00:00Z', '2026-01-01T00:00:00+24:00', '2026-01-01T00:00:00-00:00']) {
    assert.throws(() => blogDate(invalid, 'publishDate', 'sample'), /sample: publishDate/)
  }
  assert.equal(blogDate('2024-02-29T12:00:00Z', 'publishDate', 'sample'), '2024-02-29T12:00:00.000Z')
  for (const patch of [{ title: ' ' }, { title: '<span></span>' }, { description: '' }, { author: 'unknown' }, { updatedDate: '2025-01-01T00:00:00Z' }]) {
    assert.throws(() => validateBlogVars({ ...metadata, ...patch }, 'sample'), /sample:/)
  }
  assert.equal(validateBlogVars({ ...metadata, updatedDate: '2026-01-01T22:30:00Z' }, 'sample').updatedDate, '2026-01-01T22:30:00.000Z')
})

test('projection sorts by instant then URL, does not mutate inputs or filter future posts', () => {
  const posts = [sample({ url: '/blog/z/' }), sample({ url: '/blog/future/', publishDate: '2099-01-01T00:00:00Z' }), sample({ url: '/blog/a/', publishDate: '2026-01-02T00:30:00+02:00' })]
  const original = structuredClone(posts)
  const data = projectBlog(posts)
  assert.deepEqual(data.blogPosts.map(p => p.url), ['/blog/future/', '/blog/a/', '/blog/z/'])
  assert.ok(data.blogPosts.every(p => !Object.hasOwn(p, 'html')))
  assert.deepEqual(posts, original)
  assert.deepEqual(projectBlog([...posts].reverse()), data)
})

test('native drafts stay in preview summaries but never enter feeds; feed limit applies after filtering', async () => {
  for (const sourceId of ['blog/draft/page.draft.md', 'blog/note.draft.md']) {
    assert.equal((await readBlogPost(page({ sourceId }))).draft, true)
  }
  const posts = Array.from({ length: 25 }, (_, i) => sample({ url: `/blog/${String(i).padStart(2, '0')}/` }))
  posts.unshift(sample({ url: '/blog/draft/', draft: true, publishDate: '2099-01-01T00:00:00Z' }))
  const data = projectBlog(posts)
  assert.equal(data.blogPosts.length, 26)
  assert.equal(data.blogFeed.length, 20)
  assert.ok(data.blogFeed.every(post => !post.draft))
  assert.equal(JSON.parse(jsonFeed(posts, site)).items.length, 20)
  assert.equal(load(atomFeed(posts, site), { xml: true })('entry').length, 20)
  assert.doesNotMatch(jsonFeed(posts, site), /blog\/draft/)
  assert.doesNotMatch(atomFeed(posts, site), /blog\/draft/)
})

test('feed bodies resolve links, fragments and local assets against each canonical post URL', () => {
  const post = sample({ html: '<a href="../other/?a=1&amp;b=2">Other</a><a href="#section">Section</a><img src="./image.png"><video poster="poster.jpg" src="/clip.mp4"></video><a href="mailto:info@oro.computer">Email</a><img src="data:image/png;base64,abc"><picture><source srcset="./small.png 480w, ./large.png 960w"><img src="./small.png" srcset="data:image/png;base64,abc 1x, ./large.png 2x"></picture>' })
  const $ = load(feedHtml(post, site))
  assert.equal($('a').eq(0).attr('href'), site + '/blog/other/?a=1&b=2')
  assert.equal($('a').eq(1).attr('href'), site + '/blog/hello/#section')
  assert.equal($('img').eq(0).attr('src'), site + '/blog/hello/image.png')
  assert.equal($('video').attr('poster'), site + '/blog/hello/poster.jpg')
  assert.equal($('video').attr('src'), site + '/clip.mp4')
  assert.equal($('a').eq(2).attr('href'), 'mailto:info@oro.computer')
  assert.equal($('img').eq(1).attr('src'), 'data:image/png;base64,abc')
  assert.equal($('source').attr('srcset'), site + '/blog/hello/small.png 480w, ' + site + '/blog/hello/large.png 960w')
  assert.equal($('picture img').attr('srcset'), 'data:image/png;base64,abc 1x, ' + site + '/blog/hello/large.png 2x')
})

test('JSON Feed 1.1 and Atom preserve escaped metadata, full content, updates and stable IDs', () => {
  const post = sample({ updatedDate: '2026-03-01T00:00:00.000Z' })
  const feed = JSON.parse(jsonFeed([post], site))
  assert.equal(feed.version, 'https://jsonfeed.org/version/1.1')
  assert.equal(feed.items[0].id, site + post.url)
  assert.equal(feed.items[0].date_modified, post.updatedDate)
  assert.equal(feed.items[0].content_html, post.html)
  assert.deepEqual(feed.items[0].authors, [{ name: post.authorName }])
  const xml = atomFeed([post], site)
  assert.match(xml, /Hello &amp; &lt;Oro&gt;/)
  const $ = load(xml, { xml: true })
  assert.equal($('feed').attr('xmlns'), 'http://www.w3.org/2005/Atom')
  assert.equal($('feed > updated').text(), post.updatedDate)
  assert.equal($('entry > id').text(), site + post.url)
  assert.equal($('entry > title').text(), post.title)
  assert.equal($('entry > summary').text(), post.description)
  assert.equal($('content').text(), post.html)
  assert.equal($('author > name').text(), post.authorName)
  const changed = sample({ publishDate: '2027-01-01T00:00:00.000Z' })
  assert.equal(JSON.parse(jsonFeed([changed], site)).items[0].id, feed.items[0].id)
  assert.equal(load(atomFeed([changed], site), { xml: true })('entry > id').text(), $('entry > id').text())
})

test('empty feeds are deterministic with an epoch Atom updated date', () => {
  assert.deepEqual(JSON.parse(jsonFeed([], site)).items, [])
  const xml = atomFeed([], site)
  assert.equal(load(xml, { xml: true })('updated').text(), '1970-01-01T00:00:00.000Z')
  assert.equal(xml, atomFeed([], site))
})

test('index declares only summary dependencies, escapes text and displays feeds and empty state', async () => {
  assert.deepEqual(indexVars.dataDeps, ['blogPosts', 'blogArchives'])
  assert.deepEqual(jsonDeps, ['blogFeed'])
  assert.deepEqual(atomDeps, ['blogFeed'])
  // These renderers only consume vars/data; PageInfo is unused by the index.
  const renderIndex = (posts: BlogPost[]) => blogPage({ vars: indexVars, data: projectBlog(posts), page: {} as never })
  const empty = load(await renderIndex([]))
  assert.match(empty('.blog-empty').text(), /No posts yet/)
  assert.equal(empty('a[href="/feed.json"]').length, 1)
  assert.equal(empty('a[href="/feed.xml"]').length, 1)
  const html = await renderIndex([sample({ title: '<script>bad</script>' })])
  assert.equal(load(html)('script').length, 0)
})

test('article and index layouts supply their own reading surfaces without duplicating the H1', async () => {
  const index = await blogLayout({ vars: {}, children: '<h1>Blog</h1>', page: {} as never, data: {} })
  assert.equal(load(index)('main#main.blog-main h1').text(), 'Blog')
  const output = await postLayout({ vars: metadata, children: '<h1>Hello</h1><p>Body</p>', page: { url: '/blog/hello/' } as never, data: {} })
  const $ = load(output)
  assert.equal($('main#main.blog-main').length, 1)
  assert.equal($('h1').length, 1)
  assert.equal($('article a[href="/blog/"]').length, 2)
  assert.match($('.blog-byline').text(), /Oro Computer/)
  assert.equal($('.blog-byline a[rel="author"]').attr('href'), site)
  assert.equal($('time').attr('datetime'), '2026-01-01T22:30:00.000Z')
})
