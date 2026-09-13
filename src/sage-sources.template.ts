import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { sources } from './lib/artifacts.ts'
export const dataDeps = ['sageExports'] satisfies DataDeps<Pick<DocsData, 'sageExports'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'sageExports'>> = ({ data }) => sources(data.sageExports)
export default template
