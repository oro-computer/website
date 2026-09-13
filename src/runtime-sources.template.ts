import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { sources } from './lib/artifacts.ts'
export const dataDeps = ['runtimeExports'] satisfies DataDeps<Pick<DocsData, 'runtimeExports'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'runtimeExports'>> = ({ data }) => sources(data.runtimeExports)
export default template
