import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { collectionIndex } from './lib/artifacts.ts'
export const dataDeps = ['runtimeNavigation'] satisfies DataDeps<Pick<DocsData, 'runtimeNavigation'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'runtimeNavigation'>> = ({ data }) => collectionIndex('runtime', data.runtimeNavigation)
export default template
