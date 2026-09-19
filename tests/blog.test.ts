import test from 'node:test'
import assert from 'node:assert/strict'
import { load } from 'cheerio'
import { blogDate, formatBlogDate, projectBlog, readBlogPost, validateBlogVars, type BlogPage, type BlogPost } from '#lib/blog.ts'
import { atomFeed, feedHtml, jsonFeed } from '#lib/blog-feeds.ts'
import { resolveBlogAuthors } from '#lib/authors.ts'
import blogPage, { vars as indexVars } from '../src/blog/page.ts'
import blogLayout from '../src/layouts/blog-index.layout.ts'
import postLayout from '../src/layouts/blog.layout.ts'
import { dataDeps as jsonDeps } from '../src/feed.json.template.ts'
import { dataDeps as atomDeps } from '../src/feed.xml.template.ts'

const site = 'https://oro.computer'
const metadata = { authors: ['oro-computer'], title: '**Hello** &amp; `Oro`', description: 'A real description', publishDate: '2026-01-02T00:30:00+02:00' }
const sampleAuthors = await resolveBlogAuthors(['oro-computer'], 'sample')
const sample = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  url: '/blog/hello/', title: 'Hello & <Oro>', description: 'Quotes " & <tags>',
  publishDate: '2026-01-01T22:30:00.000Z', authors: [...sampleAuthors],
  html: '<h1>Hello</h1><p>Full body &amp; more.</p>', ...overrides,
})
const page = (overrides: Partial<BlogPage> = {}): BlogPage => ({
  sourceId: 'blog/hello/page.md', vars: metadata, pageInfo: { url: '/blog/hello/', type: 'md' },
  renderInnerPage: async () => '<h1>Hello &amp; Oro</h1><p>Complete body</p>', ...overrides,
})

test('readBlogPost normalizes titles and dates and returns a cloneable inner-body projection', async () => {
  const post = await readBlogPost(page())
  assert.equal(post.title, 'Hello & Oro')
  assert.equal(post.publishDate, '2026-01-01T22:30:00.000Z')
  assert.deepEqual(post.authors, await resolveBlogAuthors(metadata.authors, 'sample'))
  assert.match(post.html, /Complete body/)
  assert.deepEqual(structuredClone(post), post)
  assert.equal(formatBlogDate(post.publishDate), 'January 1, 2026')
  await assert.rejects(readBlogPost(page({ pageInfo: { url: '/blog/hello/', type: 'html' } })), /must be Markdown/)
})

test('author registry requires a nonempty array of unique registered usernames', async () => {
  for (const value of [undefined, null, [], 'bcomnes', 1, {}, ['unknown'], [''], ['Bcomnes'], [' bcomnes '], ['toString'], ['__proto__'], ['joe'], ['bret'], ['oro'], ['bcomnes', 'bcomnes']]) {
    await assert.rejects(async () => resolveBlogAuthors(value, 'sample'), /sample:/)
    await assert.rejects(() => validateBlogVars({ ...metadata, authors: value }, 'sample'), /sample:/)
  }
  const { authors: _authors, ...missingAuthors } = metadata
  await assert.rejects(() => validateBlogVars(missingAuthors, 'sample'), /sample:/)
  const authors = ['jwerle', 'bcomnes']
  assert.deepEqual((await validateBlogVars({ ...metadata, authors }, 'sample')).authors, await resolveBlogAuthors(authors, 'sample'))
})

test('registry profiles propagate through projections, linked avatar bylines and both feeds', async () => {
  for (const usernames of [['jwerle'], ['bcomnes'], ['oro-computer'], ['bcomnes', 'jwerle']]) {
    const authors = await resolveBlogAuthors(usernames, 'sample')
    const vars = { ...metadata, authors: usernames }
    const post = await readBlogPost(page({ vars }))
    assert.deepEqual(post.authors, authors)
    assert.deepEqual(projectBlog([post]).blogPosts[0].authors, authors)
    const output = await postLayout({ vars, children: post.html, page: { url: post.url } as never, data: {} })
    const byline = load(output)('.blog-byline a[rel="author"]')
    assert.equal(byline.length, authors.length)
    authors.forEach((author, index) => {
      assert.equal(byline.eq(index).text().trim(), author.name)
      assert.equal(byline.eq(index).attr('href'), author.url)
      assert.equal(byline.eq(index).find('img').attr('src'), author.avatar)
    })
    assert.deepEqual(JSON.parse(jsonFeed([post], site)).items[0].authors, authors.map(({ name, url, avatar }) => ({ name, url, avatar: new URL(avatar, site).href })))
    const atom = load(atomFeed([post], site), { xml: true })
    assert.deepEqual(atom('entry > author').toArray().map(element => ({ name: atom(element).find('name').text(), uri: atom(element).find('uri').text() })), authors.map(({ name, url }) => ({ name, uri: url })))
  }
})

test('Atom escapes author names and required profile URIs', async () => {
  const author = { ...(await resolveBlogAuthors(['bcomnes'], 'sample'))[0]!, name: 'Name & <Friends>', url: 'https://example.com/?a=1&b=2' }
  const xml = atomFeed([sample({ authors: [author] })], site)
  assert.match(xml, /<uri>https:\/\/example\.com\/\?a=1&amp;b=2<\/uri>/)
  assert.match(xml, /Name &amp; &lt;Friends&gt;/)
  assert.equal(load(xml, { xml: true })('author > uri').text(), author.url)
  assert.equal(load(xml, { xml: true })('author > name').text(), author.name)
})

test('metadata rejects missing text, ambiguous dates, invalid calendar dates and backwards updates', async () => {
  for (const invalid of ['', '2026-01-01', '2026-01-01T00:00:00', '2026-02-29T00:00:00Z', '2026-04-31T00:00:00Z', '2026-01-01T24:00:00Z', '2026-01-01T00:00:00+24:00', '2026-01-01T00:00:00-00:00']) {
    assert.throws(() => blogDate(invalid, 'publishDate', 'sample'), /sample: publishDate/)
  }
  assert.equal(blogDate('2024-02-29T12:00:00Z', 'publishDate', 'sample'), '2024-02-29T12:00:00.000Z')
  for (const patch of [{ title: ' ' }, { title: '<span></span>' }, { description: '' }, { authors: ['unknown'] }, { updatedDate: '2025-01-01T00:00:00Z' }]) {
    await assert.rejects(() => validateBlogVars({ ...metadata, ...patch }, 'sample'), /sample:/)
  }
  assert.equal((await validateBlogVars({ ...metadata, updatedDate: '2026-01-01T22:30:00Z' }, 'sample')).updatedDate, '2026-01-01T22:30:00.000Z')
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
  assert.deepEqual(feed.items[0].authors, post.authors.map(({ name, url, avatar }) => ({ name, url, avatar: new URL(avatar, site).href })))
  const xml = atomFeed([post], site)
  assert.match(xml, /Hello &amp; &lt;Oro&gt;/)
  const $ = load(xml, { xml: true })
  assert.equal($('feed').attr('xmlns'), 'http://www.w3.org/2005/Atom')
  assert.equal($('feed > updated').text(), post.updatedDate)
  assert.equal($('entry > id').text(), site + post.url)
  assert.equal($('entry > title').text(), post.title)
  assert.equal($('entry > summary').text(), post.description)
  assert.equal($('content').text(), post.html)
  assert.equal($('author > name').text(), post.authors[0]!.name)
    assert.equal($('author > uri').text(), post.authors[0]!.url)
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
  const output = await postLayout({ vars: metadata, children: '<p>Body</p>', page: { url: '/blog/hello/' } as never, data: {} })
  const $ = load(output)
  assert.equal($('main#main.blog-main').length, 1)
  assert.equal($('h1').length, 1)
  assert.equal($('.blog-title').text(), 'Hello & Oro')
  assert.equal($('.blog-title').next().hasClass('blog-byline'), true)
  assert.equal($('.blog-prose h1').length, 0)
  await assert.rejects(async () => postLayout({ vars: { ...metadata, title: '' }, children: '<p>Body</p>', page: { url: '/blog/hello/' } as never, data: {} }), /title is required/)
  assert.equal($('article a[href="/blog/"]').length, 2)
  const author = (await resolveBlogAuthors(metadata.authors, 'sample'))[0]!
  assert.ok($('.blog-byline').text().includes(author.name))
  assert.equal($('.blog-byline a[rel="author"]').attr('href'), author.url)
  assert.equal($('.blog-byline a[rel="author"] img').attr('src'), author.avatar)
  assert.equal($('time').attr('datetime'), '2026-01-01T22:30:00.000Z')
})
