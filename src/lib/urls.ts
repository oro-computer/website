import { posix } from 'node:path'
import { collections, docUrl, type Collection } from './collections.ts'
const origin = 'https://oro.computer'
export function canonicalLink(
  href: string,
  base: string,
  sourcePath?: string,
): string {
  if (
    !href ||
    href.startsWith('#') ||
    /^(?:mailto:|tel:|data:|javascript:)/i.test(href)
  )
    return href
  const url = new URL(href, origin + base)
  if (url.origin !== origin) return href
  const entry = Object.entries(collections).find(([, c]) =>
    base.startsWith(c.base),
  )
  if (url.searchParams.has('p')) {
    let target = Object.entries(collections).find(
      ([, c]) => url.pathname.replace(/index\.html$/, '') === c.base,
    )
    if (!target && entry)
      target = [
        url.pathname.includes('wiki/') ? 'silkWiki' : entry[0],
        entry[1],
      ]
    if (target) {
      const id = url.searchParams.get('p')!.replace(/^docs\//, '')
      url.searchParams.delete('p')
      return (
        docUrl(target[0] as Collection, id) +
        (url.searchParams.size ? `?${url.searchParams}` : '') +
        url.hash
      )
    }
  }
  if (url.pathname.endsWith('/llms.txt'))
    return url.pathname + url.search + url.hash
  // Absolute raw-source endpoints work across collections, including links
  // imported from the published website rather than a relative upstream path.
  for (const [key, c] of Object.entries(collections)) {
    if (
      url.pathname.startsWith(c.base + 'source/') &&
      /\.(md|txt)$/.test(url.pathname)
    )
      return (
        docUrl(
          key as Collection,
          url.pathname.slice((c.base + 'source/').length),
        ) +
        url.search +
        url.hash
      )
  }
  if (entry && /\.(md|txt)$/.test(url.pathname)) {
    const [key, c] = entry
    const path = href.split(/[?#]/)[0]
    if (path.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
      return url.pathname + url.search + url.hash
    } else {
      let k = key as Collection
      let id: string
      if (path.startsWith('wiki/') || path.startsWith('docs/wiki/')) {
        k = 'silkWiki'
        id = path.replace(/^(docs\/)?wiki\//, '')
      } else if (path.startsWith('docs/')) {
        k = c.product === 'silk' ? 'silk' : k
        id = path.slice(5)
      } else
        id = posix.normalize(
          posix.join(posix.dirname(sourcePath || 'start.md'), path),
        )
      if (id.startsWith('../docs/')) {
        k = c.product === 'silk' ? 'silk' : k
        id = id.slice(8)
      }
      if (id.startsWith('../wiki/')) {
        k = 'silkWiki'
        id = id.slice(8)
      }
      return docUrl(k, id) + url.hash
    }
  }
  return url.pathname + url.search + url.hash
}
