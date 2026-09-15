import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from '#lib/docs.ts'
import { pack } from '#lib/artifacts.ts'
export const dataDeps = ["slgExports"] satisfies DataDeps<Pick<DocsData, 'slgExports'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<DocsData, 'slgExports'>> = ({ data, vars }) => pack('slg', data.slgExports, vars.siteUrl)
export default template
