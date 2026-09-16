import type { GlobalDataFunction } from '@domstack/static/types.js'
import { collections, type Collection } from '#lib/collections.ts'
import { collectRedirects, type RedirectPage } from '#lib/redirects.ts'
import { editUrl, plainText, projectCollection, validateDocVars, type Doc, type DocsData } from '#lib/docs.ts'

type IndexedPage = RedirectPage & { doc?: Doc }
export type DocsIndex = Map<string, IndexedPage>

const globalData: GlobalDataFunction<DocsData, Record<string, unknown>, string, DocsIndex> = async ({
  pages, previousState, changes, setState,
}) => {
  const reset = changes.kind === 'reset' || previousState === undefined
  const index: DocsIndex = reset ? new Map() : new Map(previousState)
  const inputs = changes.kind === 'delta' && !reset ? changes.upserted : pages
  if (changes.kind === 'delta') {
    for (const sourceId of changes.removed) index.delete(sourceId)
  }

  for (const page of inputs) {
    const { url, outputRelname, pageFile } = page.pageInfo
    const source = page.sourceId
    // Retain only cloneable projections, never PageData or renderer instances.
    const entry: IndexedPage = {
      pageInfo: { url, outputRelname, pageFile: { relname: pageFile.relname } },
      vars: { redirectFrom: page.vars.redirectFrom },
    }
    if (page.vars.docsCollection !== undefined) {
      const v = validateDocVars(page.vars, source)
      if (page.pageInfo.type !== 'md') throw new Error(`${source}: documentation must be Markdown`)
      entry.doc = {
        collection: v.docsCollection,
        id: v.sourcePath.replace(/\.(md|txt)$/, ''),
        title: v.title, description: v.description, section: v.section, order: v.order,
        url, sourcePath: v.sourcePath,
        markdown: await page.readMarkdownContent(),
        searchText: plainText(await page.renderInnerPage()),
        githubRepo: v.githubRepo, githubRef: v.githubRef,
        editUrl: editUrl(source),
      }
    }
    index.set(source, entry)
  }

  // Cheap views reference cached documents; existing data fingerprints decide
  // whether their consumers rebuild, without a second invalidation system.
  const indexedPages = [...index.values()]
  const docs: Record<Collection, Doc[]> = {
    runtime: [], silk: [], silkWiki: [], virtnosis: [], sage: [], slg: [],
  }
  for (const { doc } of indexedPages) {
    if (doc) docs[doc.collection].push(doc)
  }
  const data = {
    redirects: collectRedirects(indexedPages),
    routes: indexedPages.map(page => page.pageInfo.url).sort(),
    navigation: {},
  } as DocsData
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
  setState(index)
  return data
}
export default globalData
