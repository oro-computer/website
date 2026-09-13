import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { sources } from './lib/artifacts.ts'
export const dataDeps = ['silkWikiExports'] satisfies DataDeps<Pick<DocsData, 'silkWikiExports'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'silkWikiExports'>> = ({ data }) => sources(data.silkWikiExports)
export default template
