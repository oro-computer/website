import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { sources } from './lib/artifacts.ts'
export const dataDeps = ['silkExports'] satisfies DataDeps<Pick<DocsData, 'silkExports'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'silkExports'>> = ({ data }) => sources(data.silkExports)
export default template
