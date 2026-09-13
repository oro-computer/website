import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { collectionIndex } from './lib/artifacts.ts'
export const dataDeps = ['virtnosisNavigation'] satisfies DataDeps<Pick<DocsData, 'virtnosisNavigation'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'virtnosisNavigation'>> = ({ data }) => collectionIndex('virtnosis', data.virtnosisNavigation)
export default template
