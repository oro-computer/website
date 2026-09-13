import type { TemplateFunction } from '@domstack/static/types.js'
import { collections } from './lib/collections.ts'
import { output } from './lib/artifacts.ts'
export const dataDeps = []
const artifacts: TemplateFunction<{ siteUrl: string }> = ({ vars }) => [
  output('/llms.txt', '# Oro Computer\n\n' +
    [...new Set(Object.values(collections).map(c => c.product))]
      .map(p => `- [${p} documentation](${new URL(`/${p}/llms.txt`, vars.siteUrl).href})`)
      .join('\n') + '\n'),
  output('/.nojekyll', ''),
]
export default artifacts
