import type { GlobalDataFunction } from '@domstack/static/types.js'
import { collections, type Collection } from '#lib/collections.ts'
import { collectRedirects } from '#lib/redirects.ts'
import { editUrl, plainText, projectCollection, validateDocVars, type Doc, type DocsData } from '#lib/docs.ts'
const globalData: GlobalDataFunction<DocsData, Record<string, unknown>, string> = async ({ pages }) => {
  const redirects = collectRedirects(pages)
  const docs: Record<Collection, Doc[]> = {
      runtime: [], silk: [], silkWiki: [], virtnosis: [], sage: [], slg: [],
    }
  for (const page of pages) {
    if (page.vars.docsCollection === undefined) continue
    const source = page.pageInfo.pageFile.relname
    const v = validateDocVars(page.vars, source)
    if (page.pageInfo.type !== 'md') throw new Error(`${source}: documentation must be Markdown`)
    docs[v.docsCollection].push({
      collection: v.docsCollection,
      id: v.sourcePath.replace(/\.(md|txt)$/, ''),
      title: v.title, description: v.description, section: v.section, order: v.order,
      url: page.pageInfo.url, sourcePath: v.sourcePath,
      markdown: await page.readMarkdownContent(),
      searchText: plainText(await page.renderInnerPage()),
      githubRepo: v.githubRepo, githubRef: v.githubRef,
      editUrl: editUrl(source),
    })
  }
  const data = { redirects, routes: pages.map(p => p.pageInfo.url).sort(), navigation: {} } as DocsData
  for (const collection of Object.keys(collections) as Collection[]) {
    const list = docs[collection]
    list.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id, 'en'))
    data.navigation[collection] = projectCollection(list)
    data[`${collection}Exports`] = list.map(({ collection, id, title, sourcePath, url, markdown }) => ({ collection, id, title, sourcePath, url, markdown }))
    data[`${collection}Search`] = {
      kind: collection === 'silkWiki' ? 'wiki' : 'docs', count: list.length,
      items: list.map(d => ({ id: d.id, title: d.title, file: d.sourcePath, url: d.url, section: d.section, summary: d.description, text: d.searchText })),
    }
  }
  return data
}
export default globalData
