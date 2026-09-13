import type { TemplateFunction } from '@domstack/static/types.js'
import { collections } from './lib/collections.ts'
import { rawUrl, type DocsData, type Doc } from './lib/docs.ts'
export const dataDeps = ['docs', 'routes']
const artifacts: TemplateFunction<Record<string, unknown>, DocsData> = ({
  data,
}) => {
  const outputs: { outputName: string; content: string }[] = []
  const emit = (name: string, content: string) =>
    outputs.push({ outputName: name.replace(/^\//, ''), content })
  const json = (name: string, value: unknown) =>
    emit(name, JSON.stringify(value, null, 2) + '\n')
  const packs: Record<string, Doc[]> = {}
  for (const [key, c] of Object.entries(collections)) {
    const docs = data.docs[key as keyof typeof collections]
    const sections = [...new Set(docs.map((d) => d.section))].map((name) => ({
      name,
      items: docs
        .filter((d) => d.section === name)
        .map((d) => ({
          id: d.id,
          title: d.title,
          file: d.sourcePath,
          url: d.url,
        })),
    }))
    json(c.base + 'index.json', {
      kind: key === 'silkWiki' ? 'wiki' : 'docs',
      count: docs.length,
      sections,
    })
    json(c.base + 'search.json', {
      kind: key === 'silkWiki' ? 'wiki' : 'docs',
      count: docs.length,
      items: docs.map((d) => ({
        id: d.id,
        title: d.title,
        file: d.sourcePath,
        url: d.url,
        section: d.section,
        summary: d.description,
        text: d.searchText,
      })),
    })
    for (const doc of docs) emit(rawUrl(doc), doc.markdown)
    ;(packs[c.product] ||= []).push(...docs)
  }
  for (const [product, docs] of Object.entries(packs))
    emit(
      `/${product}/llms.txt`,
      `# ${product} documentation\n\n` +
        docs
          .map(
            (d) =>
              `## ${d.title}\n\nURL: https://oro.computer${d.url}\nSource: https://oro.computer${rawUrl(d)}\n\n${d.markdown}`,
          )
          .join('\n---\n\n'),
    )
  emit(
    '/llms.txt',
    '# Oro Computer\n\n' +
      Object.keys(packs)
        .map(
          (p) => `- [${p} documentation](https://oro.computer/${p}/llms.txt)`,
        )
        .join('\n') +
      '\n',
  )
  emit(
    '/sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      data.routes
        .map((url) => `<url><loc>https://oro.computer${url}</loc></url>`)
        .join('') +
      '</urlset>\n',
  )
  emit('/.nojekyll', '')
  return outputs
}
export default artifacts
