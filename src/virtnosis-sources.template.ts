import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { sources } from './lib/artifacts.ts'
export const dataDeps = ['virtnosisExports'] satisfies DataDeps<Pick<DocsData, 'virtnosisExports'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'virtnosisExports'>> = ({ data }) => sources(data.virtnosisExports)
export default template
