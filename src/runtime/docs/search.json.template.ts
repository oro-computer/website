import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from '#lib/docs.ts'
import { json } from '#lib/artifacts.ts'
export const dataDeps = ['runtimeSearch'] satisfies DataDeps<Pick<DocsData, 'runtimeSearch'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'runtimeSearch'>> = ({ data }) => json(data.runtimeSearch)
export default template
