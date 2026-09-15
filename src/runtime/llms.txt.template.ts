import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from '#lib/docs.ts'
import { pack } from '#lib/artifacts.ts'
export const dataDeps = ["runtimeExports"] satisfies DataDeps<Pick<DocsData, 'runtimeExports'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<DocsData, 'runtimeExports'>> = ({ data, vars }) => pack('runtime', data.runtimeExports, vars.siteUrl)
export default template
