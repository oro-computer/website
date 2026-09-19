import { rawUrl, type ExportDoc } from './docs.ts'

export const json = (value: unknown): string => JSON.stringify(value, null, 2) + '\n'


export function pack(product: string, docs: ExportDoc[], siteUrl: string): string {
  return `# ${product} documentation\n\n` + docs.map(d =>
    `## ${d.title}\n\nURL: ${new URL(d.url, siteUrl).href}\nSource: ${new URL(rawUrl(d), siteUrl).href}\n\n${d.markdown}`,
  ).join('\n---\n\n')
}
export function xmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)
}
export function sitemap(routes: string[], siteUrl: string): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + routes.map(url => `<url><loc>${xmlEscape(new URL(url, siteUrl).href)}</loc></url>`).join('') + '</urlset>\n'
}
