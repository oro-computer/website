import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from '#lib/docs.ts'
import { sitemap } from '#lib/artifacts.ts'
export const dataDeps = ['routes'] satisfies DataDeps<Pick<DocsData, 'routes'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<DocsData, 'routes'>> = ({ data, vars }) => sitemap(data.routes, vars.siteUrl)
export default template
