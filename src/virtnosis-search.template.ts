import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { json } from './lib/artifacts.ts'
export const dataDeps = ['virtnosisSearch'] satisfies DataDeps<Pick<DocsData, 'virtnosisSearch'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'virtnosisSearch'>> = ({ data }) => json('/virtnosis/docs/search.json', data.virtnosisSearch)
export default template
