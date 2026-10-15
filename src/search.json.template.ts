import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { SiteSearchData } from '#lib/search.ts'
export const dataDeps = ['siteSearch'] satisfies DataDeps<SiteSearchData>
const template: TemplateFunction<Record<string, unknown>, SiteSearchData> = ({ data }) => JSON.stringify(data.siteSearch) + '\n'
export default template
