import { collections, type Collection } from './collections.ts'
import { rawUrl, type Navigation, type ExportDoc } from './docs.ts'
export interface Output { outputName: string; content: string }
export const output = (name: string, content: string): Output => ({ outputName: name.replace(/^\//, ''), content })
export const json = (name: string, value: unknown): Output => output(name, JSON.stringify(value, null, 2) + '\n')
export function collectionIndex(collection: Collection, navigation: Navigation): Output {
  return json(collections[collection].base + 'index.json', {
    kind: collection === 'silkWiki' ? 'wiki' : 'docs',
    count: Object.keys(navigation.bySource).length,
    sections: navigation.sections.map(s => ({ name: s.name, items: s.items.map(d => ({
      id: d.id, title: d.title, file: d.sourcePath, url: d.url,
    })) })),
  })
}
export function sources(docs: ExportDoc[]): Output[] {
  return docs.map(d => output(rawUrl(d), d.markdown))
}
export function pack(product: string, docs: ExportDoc[], siteUrl: string): Output {
  return output(`/${product}/llms.txt`, `# ${product} documentation\n\n` + docs.map(d =>
    `## ${d.title}\n\nURL: ${new URL(d.url, siteUrl).href}\nSource: ${new URL(rawUrl(d), siteUrl).href}\n\n${d.markdown}`,
  ).join('\n---\n\n'))
}
export function xmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)
}
export function sitemap(routes: string[], siteUrl: string): Output {
  return output('/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + routes.map(url => `<url><loc>${xmlEscape(new URL(url, siteUrl).href)}</loc></url>`).join('') + '</urlset>\n')
}
