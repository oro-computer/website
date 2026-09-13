import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { pack } from './lib/artifacts.ts'
export const dataDeps = ["sageExports"] satisfies DataDeps<Pick<DocsData, 'sageExports'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<DocsData, 'sageExports'>> = ({ data, vars }) => pack('sage', data.sageExports, vars.siteUrl)
export default template
