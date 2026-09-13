import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { pack } from './lib/artifacts.ts'
export const dataDeps = ["silkExports","silkWikiExports"] satisfies DataDeps<Pick<DocsData, 'silkExports' | 'silkWikiExports'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<DocsData, 'silkExports' | 'silkWikiExports'>> = ({ data, vars }) => pack('silk', [...data.silkExports, ...data.silkWikiExports], vars.siteUrl)
export default template
