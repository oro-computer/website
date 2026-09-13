import { linkReferences, type Reference } from './references.ts'
/** One-time migration. Usage: node tools/migration/migrate.ts /path/to/legacy-checkout */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { resolve, relative, dirname, join } from 'node:path'
import { load } from 'cheerio'
import {
  collections,
  docUrl,
  type Collection,
} from '../../src/lib/collections.ts'
import { canonicalLink } from '../../src/lib/urls.ts'
import MarkdownIt from 'markdown-it'
import { publicContent, description } from './content.ts'
const legacy = resolve(process.argv[2] || '.')
const dest = resolve('src')
async function write(path: string, text: string) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, text)
}
const baseline: {
  html: string[]
  documents: { collection: string; id: string; source: string; url: string }[]
} = { html: [], documents: [] }
const inventory: { source: string; links: string[]; headings: string[] }[] = []
const parser = new MarkdownIt({ html: true })
const catalog: Reference[] = []
for (const [key, c] of Object.entries(collections)) {
  const index = JSON.parse(
    await readFile(join(legacy, c.base, 'index.json'), 'utf8'),
  )
  for (const section of index.sections)
    for (const item of section.items)
      catalog.push({
        collection: key as Collection,
        id: item.id,
        title: item.title,
      })
}
for (const [key, c] of Object.entries(collections)) {
  const collection = key as Collection
  const index = JSON.parse(
    await readFile(join(legacy, c.base, 'index.json'), 'utf8'),
  )
  let order = 0
  const indexed = new Map<
    string,
    { title: string; section: string; order: number }
  >()
  for (const section of index.sections)
    for (const item of section.items)
      indexed.set(item.file, {
        title: item.title,
        section: section.name,
        order: order++,
      })
  const source = join(legacy, c.base, 'source')
  for (const file of (await readdir(source, { recursive: true }))
    .filter((f) => /\.(md|txt)$/.test(f))
    .sort()) {
    const id = file.replace(/\.(md|txt)$/, '')
    const original = await readFile(join(source, file), 'utf8')
    const rendered = load(parser.render(original))
    inventory.push({
      source: c.base + 'source/' + file,
      links: rendered('a[href]')
        .map((_i, el) => rendered(el).attr('href')!)
        .get(),
      headings: rendered('h1,h2,h3,h4,h5,h6')
        .map((_i, el) => rendered(el).text())
        .get(),
    })
    const body = linkReferences(
      publicContent(original, collection, file),
      collection,
      file,
      catalog,
    )
    const info = indexed.get(file) || {
      title: original.match(/^# (.+)$/m)?.[1] || id,
      section: id.split('/')[0],
      order: order++,
    }
    const vars = {
      layout: collection === 'silk' && id === 'spec/2026' ? 'spec' : 'docs',
      title: info.title.replace(/`/g, ''),
      description: description(body),
      docsCollection: collection,
      section: info.section,
      order: info.order,
      sourcePath: file,
      githubRepo: c.repo,
      githubRef: 'master',
    }
    const url = docUrl(collection, id)
    const frontmatter = Object.entries(vars)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join('\n')
    await write(
      join(dest, url, 'page.md'),
      `---\n${frontmatter}\n---\n\n${body}`,
    )
    baseline.documents.push({
      collection,
      id,
      source: c.base + 'source/' + file,
      url,
    })
  }
}
const files = (await readdir(legacy, { recursive: true }))
  .filter(
    (f) =>
      f.endsWith('index.html') &&
      !/^(?:node_modules|src|public|_site|\.git)\//.test(f),
  )
  .sort()
for (const file of files) {
  const route = '/' + file.replace(/index\.html$/, '')
  baseline.html.push(route)
  if (baseline.documents.some((d) => d.url === route)) continue
  const $ = load(await readFile(join(legacy, file), 'utf8'))
  $('[href], [src]').each((_i, el) => {
    for (const attr of ['href', 'src']) {
      const v = $(el).attr(attr)
      if (v) $(el).attr(attr, canonicalLink(v, route))
    }
  })
  const title = $('title').text()
  const description = $('meta[name="description"]').attr('content') || ''
  const bodyClass = $('body').attr('class') || ''
  const bodyAttrs = Object.fromEntries(
    Object.entries($('body').attr() || {}).filter(([k]) =>
      k.startsWith('data-'),
    ),
  )
  const product = route.split('/')[1]
  const footerLabel = $('.footer-inner strong').text()
  const layout = route.includes('/learn/')
    ? 'learn'
    : ['runtime', 'silk', 'virtnosis', 'sage', 'slg'].includes(product)
      ? 'product'
      : 'marketing'
  const bar = $('.learn-lesson-bar')
  const chapter = bar.length
    ? {
        label: bar.find('strong').text(),
        title: bar.find('.learn-lesson-title span').text(),
        links: bar
          .find('nav a')
          .map((_i, el) => ({ url: $(el).attr('href')!, label: $(el).text() }))
          .get(),
        position: bar.find('nav span').text(),
      }
    : undefined
  if (bar.length) bar.replaceWith('<!-- learn:chapter-bar -->')
  $('.tabs-panel').removeAttr('hidden')
  const vars = {
    layout,
    title,
    description,
    bodyClass,
    bodyAttrs,
    product,
    footerLabel,
    ...(chapter ? { chapter } : {}),
  }
  await write(
    join(dest, route, 'page.vars.ts'),
    'export default ' + JSON.stringify(vars, null, 2) + '\n',
  )
  await write(join(dest, route, 'page.html'), $('main').toString() + '\n')
}
await write(
  resolve('tools/migration/link-inventory.json'),
  JSON.stringify(inventory, null, 2) + '\n',
)
await write(
  resolve('tools/migration/baseline.json'),
  JSON.stringify(baseline, null, 2) + '\n',
)
console.log(
  `Migrated ${baseline.html.length} HTML routes and ${baseline.documents.length} documents.`,
)
