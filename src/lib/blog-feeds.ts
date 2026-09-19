import { load } from 'cheerio'
import jsonfeedToAtom from 'jsonfeed-to-atom'
import { json } from '#lib/artifacts.ts'
import { projectBlog, type BlogPost } from '#lib/blog.ts'

// URLs in srcset may contain commas (notably data URLs), while ordinary
// candidates may be comma-separated without whitespace. Keep data URLs intact
// but let commas delimit every other URL token.
function absoluteSrcset(value: string, base: URL): string {
  const candidates: string[] = []
  let rest = value
  while (rest.length) {
    rest = rest.replace(/^[\t\n\f\r ,]+/, '')
    const dataUrl = /^data:/i.test(rest)
    const token = (dataUrl ? /^[^\t\n\f\r ]+/ : /^[^\t\n\f\r ,]+/).exec(rest)?.[0]
    if (!token) break
    rest = rest.slice(token.length)
    let descriptors = ''
    if (dataUrl || !rest.startsWith(',')) {
      let depth = 0
      let end = 0
      for (; end < rest.length; end++) {
        if (rest[end] === '(') depth++
        if (rest[end] === ')') depth--
        if (rest[end] === ',' && depth === 0) break
      }
      descriptors = rest.slice(0, end).trim()
      rest = rest.slice(end + 1)
    } else {
      rest = rest.slice(1)
    }
    candidates.push(new URL(token, base).href + (descriptors ? ` ${descriptors}` : ''))
  }
  return candidates.join(', ')
}

export function feedHtml(post: BlogPost, siteUrl: string): string {
  const base = new URL(post.url, siteUrl)
  const $ = load(post.html, {}, false)
  $('[href], [src], [poster]').each((_index, element) => {
    for (const attribute of ['href', 'src', 'poster']) {
      const value = $(element).attr(attribute)
      if (value !== undefined) $(element).attr(attribute, new URL(value, base).href)
    }
  })
  $('[srcset]').each((_index, element) => {
    $(element).attr('srcset', absoluteSrcset($(element).attr('srcset')!, base))
  })
  return $.html()
}

function feedData(posts: readonly BlogPost[], siteUrl: string) {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Oro Computer Blog',
    home_page_url: new URL('/blog/', siteUrl).href,
    feed_url: new URL('/feed.json', siteUrl).href,
    items: projectBlog(posts).blogFeed.map(post => ({
      id: new URL(post.url, siteUrl).href,
      url: new URL(post.url, siteUrl).href,
      title: post.title,
      summary: post.description,
      content_html: feedHtml(post, siteUrl),
      date_published: post.publishDate,
      date_modified: post.updatedDate ?? post.publishDate,
      authors: post.authors.map(author => ({
        name: author.name,
        url: author.url,
        avatar: new URL(author.avatar, siteUrl).href,
      })),
    })),
  }
}

export function jsonFeed(posts: readonly BlogPost[], siteUrl: string): string {
  return json(feedData(posts, siteUrl))
}

export function atomFeed(posts: readonly BlogPost[], siteUrl: string): string {
  const feed = feedData(posts, siteUrl)
  const xml = jsonfeedToAtom({
    ...feed,
    version: 'https://jsonfeed.org/version/1',
  })
  const $ = load(xml, { xml: true })

  // v1.2 only accepts JSON Feed 1.0, omits 1.1 author arrays, and uses the
  // clock for empty feeds. Preserve our identity and deterministic metadata.
  $('feed > id').text(feed.home_page_url)
  $('feed > updated').text(feed.items.reduce((latest, item) =>
    Date.parse(item.date_modified) > Date.parse(latest) ? item.date_modified : latest,
  feed.items[0]?.date_modified ?? '1970-01-01T00:00:00.000Z'))

  $('feed > entry').each((index, element) => {
    const item = feed.items[index]
    const entry = $(element)
    for (const author of item.authors) {
      entry.append($('<author/>').append(
        $('<name/>').text(author.name),
        $('<uri/>').text(author.url),
      ))
    }
    // The converter pretty-prints whitespace around CDATA; retain exact body text.
    entry.find('content[type="html"]').text(item.content_html)
  })

  return $.xml() + '\n'
}
