import { load } from 'cheerio'
import { collections, type Collection } from './collections.ts'
export interface Doc {
  collection: Collection
  id: string
  title: string
  description: string
  section: string
  order: number
  url: string
  sourcePath: string
  markdown: string
  searchText: string
  githubRepo: string
  githubRef: string
}
export type DocsData = { docs: Record<Collection, Doc[]>; routes: string[] }
export function plainText(html: string): string {
  return load(html).text().replace(/\s+/g, ' ').trim()
}
export function rawUrl(doc: Doc): string {
  return collections[doc.collection].base + 'source/' + doc.sourcePath
}
