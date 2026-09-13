import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, join, extname } from 'node:path'
import { load } from 'cheerio'
const root = resolve(process.argv[2] || 'public')
const files = (await readdir(root, { recursive: true }))
  .filter((f) => f.endsWith('.html'))
  .sort()
const ids = new Map<string, Set<string>>()
const links: { file: string; url: URL; attribute: string }[] = []
const errors: string[] = []
for (const file of files) {
  const text = await readFile(join(root, file), 'utf8')
  const $ = load(text)
  const pageIds = $('[id]')
    .map((_i, e) => $(e).attr('id')!)
    .get()
  const seen = new Set<string>()
  for (const id of pageIds) {
    if (seen.has(id)) errors.push(`${file}: duplicate id ${id}`)
    seen.add(id)
  }
  ids.set(file, seen)
  for (const selector of [
    'title',
    'meta[name="description"]',
    'link[rel="canonical"]',
  ])
    if (!$(selector).length) errors.push(`${file}: missing ${selector}`)
    else if (
      !(
        selector === 'title'
          ? $(selector).text()
          : $(selector).attr(selector.startsWith('meta') ? 'content' : 'href')
      )?.trim()
    )
      errors.push(`${file}: empty ${selector}`)
  $('a[href],img[src],script[src],link[href]').each((_i, e) => {
    const attribute =
      e.tagName === 'img' || e.tagName === 'script' ? 'src' : 'href'
    const href = $(e).attr(attribute)!
    const url = new URL(
      href,
      'https://oro.computer/' + file.replace(/index\.html$/, ''),
    )
    if (url.origin !== 'https://oro.computer') return
    if (url.searchParams.has('p'))
      errors.push(`${file}: legacy query link ${href}`)
    links.push({ file, url, attribute })
  })
  if (/(?:docs-viewer|spec-viewer|marked\.min)/.test(text))
    errors.push(`${file}: legacy renderer included`)
  if (
    $('[data-docs-app],[data-spec-app]').length &&
    !$('main .prose h1').length
  )
    errors.push(`${file}: missing static article`)
}
const exists = new Map<string, boolean>()
for (const { file, url } of links) {
  let target = decodeURIComponent(url.pathname).replace(/^\//, '')
  if (!extname(target) || target.endsWith('/'))
    target = target.replace(/\/$/, '') + '/index.html'
  if (target === '/index.html') target = 'index.html'
  if (!exists.has(target))
    exists.set(
      target,
      await stat(join(root, target))
        .then((s) => s.isFile())
        .catch(() => false),
    )
  if (!exists.get(target)) errors.push(`${file}: missing ${url.pathname}`)
  else if (url.hash && ids.has(target)) {
    let hash = url.hash.slice(1)
    try {
      hash = decodeURIComponent(hash)
    } catch {}
    if (!ids.get(target)!.has(hash))
      errors.push(`${file}: missing anchor ${url.pathname}#${hash}`)
  }
}
const unique = [...new Set(errors)]
if (unique.length) {
  console.error(unique.join('\n'))
  console.error(`FAIL: ${unique.length} issues`)
  process.exitCode = 1
} else
  console.log(
    `PASS: ${files.length} HTML pages; ${links.length} internal links and anchors.`,
  )
