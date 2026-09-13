import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { sources } from './lib/artifacts.ts'
export const dataDeps = ['slgExports'] satisfies DataDeps<Pick<DocsData, 'slgExports'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'slgExports'>> = ({ data }) => sources(data.slgExports)
export default template
