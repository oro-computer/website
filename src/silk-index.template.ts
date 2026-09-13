import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { collectionIndex } from './lib/artifacts.ts'
export const dataDeps = ['silkNavigation'] satisfies DataDeps<Pick<DocsData, 'silkNavigation'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'silkNavigation'>> = ({ data }) => collectionIndex('silk', data.silkNavigation)
export default template
