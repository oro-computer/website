import type { GlobalDataFunction } from '@domstack/static/types.js'
import { collections, type Collection } from './lib/collections.ts'
import { plainText, type Doc, type DocsData } from './lib/docs.ts'
const globalData: GlobalDataFunction<DocsData> = async ({ pages }) => {
  const docs = Object.fromEntries(
    Object.keys(collections).map((k) => [k, []]),
  ) as unknown as Record<Collection, Doc[]>
  for (const page of pages) {
    const v = page.vars
    if (!v.docsCollection) continue
    const collection = v.docsCollection as Collection
    const markdown = await page.readMarkdownContent()
    docs[collection].push({
      collection,
      id: v.sourcePath.replace(/\.(md|txt)$/, ''),
      title: v.title,
      description: v.description,
      section: v.section,
      order: v.order,
      url: page.pageInfo.url,
      sourcePath: v.sourcePath,
      markdown,
      searchText: plainText(await page.renderInnerPage()),
      githubRepo: v.githubRepo,
      githubRef: v.githubRef,
    })
  }
  for (const list of Object.values(docs))
    list.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id, 'en'))
  return { docs, routes: pages.map((p) => p.pageInfo.url).sort() }
}
export default globalData
