import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { json } from './lib/artifacts.ts'
export const dataDeps = ['sageSearch'] satisfies DataDeps<Pick<DocsData, 'sageSearch'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'sageSearch'>> = ({ data }) => json('/sage/docs/search.json', data.sageSearch)
export default template
