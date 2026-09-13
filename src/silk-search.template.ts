import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { json } from './lib/artifacts.ts'
export const dataDeps = ['silkSearch'] satisfies DataDeps<Pick<DocsData, 'silkSearch'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'silkSearch'>> = ({ data }) => json('/silk/docs/search.json', data.silkSearch)
export default template
