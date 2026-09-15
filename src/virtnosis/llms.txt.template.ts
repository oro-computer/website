import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from '#lib/docs.ts'
import { pack } from '#lib/artifacts.ts'
export const dataDeps = ["virtnosisExports"] satisfies DataDeps<Pick<DocsData, 'virtnosisExports'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<DocsData, 'virtnosisExports'>> = ({ data, vars }) => pack('virtnosis', data.virtnosisExports, vars.siteUrl)
export default template
