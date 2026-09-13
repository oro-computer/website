import { load } from 'cheerio'
import { collections, sectionTitle, type Collection } from './collections.ts'
export interface DocVars {
  docsCollection: Collection
  title: string
  description: string
  section: string
  order: number
  sourcePath: string
  githubRepo: string
  githubRef: string
}
export interface Doc extends Omit<DocVars, 'docsCollection'> {
  collection: Collection
  id: string
  url: string
  markdown: string
  searchText: string
  editUrl: string
}
export type DocLink = Pick<Doc, 'id' | 'title' | 'url'>
export type NavDoc = Omit<Doc, 'markdown' | 'searchText' | 'description' | 'order'> & {
  previous: DocLink | null
  next: DocLink | null
}
export interface Navigation {
  bySource: Record<string, NavDoc>
  sections: { name: string; title: string; items: (DocLink & { sourcePath: string })[] }[]
  legacy: Record<string, string>
}
export type ExportDoc = Pick<Doc, 'collection' | 'id' | 'title' | 'sourcePath' | 'url' | 'markdown'>
export interface SearchIndex {
  kind: string
  count: number
  items: { id: string; title: string; file: string; url: string; section: string; summary: string; text: string }[]
}
export type DocsData = {
  routes: string[]
  navigation: Record<Collection, Navigation>
} &
  Record<`${Collection}Exports`, ExportDoc[]> &
  Record<`${Collection}Search`, SearchIndex>
export type NavigationData = Pick<DocsData, 'navigation'>

export function validateDocVars(v: Record<string, unknown>, source: string): DocVars {
  if (typeof v.docsCollection !== 'string' || !Object.hasOwn(collections, v.docsCollection))
    throw new Error(`${source}: unknown docsCollection ${String(v.docsCollection)}`)
  for (const key of ['title', 'description', 'section', 'sourcePath', 'githubRepo', 'githubRef'])
    if (typeof v[key] !== 'string' || (key !== 'description' && !v[key]))
      throw new Error(`${source}: ${key} must be a string${key === 'description' ? '' : ' (non-empty)'}`)
  if (typeof v.order !== 'number' || !Number.isFinite(v.order))
    throw new Error(`${source}: order must be finite`)
  const path = v.sourcePath as string
  if (!/\.(md|txt)$/.test(path) || path.startsWith('/') || path.includes('\\') || path.split('/').some(p => !p || p === '.' || p === '..'))
    throw new Error(`${source}: invalid sourcePath ${path}`)
  return v as unknown as DocVars
}
export function projectCollection(docs: Doc[]) {
  const bySource: Record<string, NavDoc> = Object.create(null)
  const legacy: Record<string, string> = Object.create(null)
  const sections: Navigation['sections'] = []
  const sourceById = new Map<string, string>()
  const link = (d: Doc): DocLink => ({ id: d.id, title: d.title, url: d.url })
  for (const [i, d] of docs.entries()) {
    if (Object.hasOwn(bySource, d.sourcePath)) throw new Error(`Duplicate document: ${d.collection}/${d.sourcePath}`)
    if (sourceById.has(d.id))
      throw new Error(`Duplicate document id "${d.id}" in collection "${d.collection}": ${sourceById.get(d.id)} and ${d.sourcePath}`)
    sourceById.set(d.id, d.sourcePath)
    const { markdown: _markdown, searchText: _search, description: _description, order: _order, ...nav } = d
    bySource[d.sourcePath] = { ...nav, previous: i ? link(docs[i - 1]) : null, next: i + 1 < docs.length ? link(docs[i + 1]) : null }
    legacy[d.id] = d.url
    let section = sections.find(s => s.name === d.section)
    if (!section) sections.push(section = { name: d.section, title: sectionTitle(d.section), items: [] })
    section.items.push({ ...link(d), sourcePath: d.sourcePath })
  }
  return { bySource, sections, legacy }
}
export function plainText(html: string): string {
  return load(html).text().replace(/\s+/g, ' ').trim()
}
export function rawUrl(doc: Pick<Doc, 'collection' | 'sourcePath'>): string {
  return collections[doc.collection].base + 'source/' + doc.sourcePath
}
export function editUrl(sourceRelname: string): string {
  return 'https://github.com/oro-computer/website/blob/master/src/' + sourceRelname.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/')
}
