export const collections = {
  runtime: {
    base: '/runtime/docs/',
    title: 'Runtime Docs',
    product: 'runtime',
    repo: 'oro-computer/runtime',
  },
  silk: {
    base: '/silk/docs/',
    title: 'Silk Docs',
    product: 'silk',
    repo: 'oro-computer/silk',
  },
  silkWiki: {
    base: '/silk/wiki/',
    title: 'Silk Wiki',
    product: 'silk',
    repo: 'oro-computer/silk',
  },
} as const
export type Collection = keyof typeof collections
export function docUrl(collection: Collection, id: string): string {
  id = id.replace(/\.(md|txt)$/, '').replace(/^\/+|\/+$/g, '')
  if (collection === 'silk' && id === 'guides/toy-logger-module')
    id = 'guides/practical-logger-module'
  if (collection === 'silk' && id === 'spec/2026') return '/silk/spec/2026/'
  return collections[collection].base + (id === 'start' ? '' : `${id}/`)
}
export function sectionTitle(section: string): string {
  const names: Record<string, string> = {
    overview: 'Start',
    cli: 'CLI',
    config: 'Configuration',
    javascript: 'JavaScript APIs',
    man: 'Man pages',
    ai: 'AI',
    mcp: 'MCP',
    api: 'APIs',
    apis: 'APIs',
    std: 'Standard library',
  }
  return (
    names[section] ||
    section.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}
