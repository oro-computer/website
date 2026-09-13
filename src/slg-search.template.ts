import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { json } from './lib/artifacts.ts'
export const dataDeps = ['slgSearch'] satisfies DataDeps<Pick<DocsData, 'slgSearch'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'slgSearch'>> = ({ data }) => json('/slg/docs/search.json', data.slgSearch)
export default template
