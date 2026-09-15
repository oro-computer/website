import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from '#lib/docs.ts'
import { json } from '#lib/artifacts.ts'
export const dataDeps = ['silkWikiSearch'] satisfies DataDeps<Pick<DocsData, 'silkWikiSearch'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'silkWikiSearch'>> = ({ data }) => json(data.silkWikiSearch)
export default template
