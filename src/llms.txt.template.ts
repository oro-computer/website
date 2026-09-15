import type { TemplateFunction } from '@domstack/static/types.js'
import { collections } from '#lib/collections.ts'

export const dataDeps = []
const template: TemplateFunction<{ siteUrl: string }> = ({ vars }) =>
  '# Oro Computer\n\n' +
    [...new Set(Object.values(collections).map(c => c.product))]
      .map(p => `- [${p} documentation](${new URL(`/${p}/llms.txt`, vars.siteUrl).href})`)
      .join('\n') + '\n'
export default template
