import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { collectionIndex } from './lib/artifacts.ts'
export const dataDeps = ['slgNavigation'] satisfies DataDeps<Pick<DocsData, 'slgNavigation'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'slgNavigation'>> = ({ data }) => collectionIndex('slg', data.slgNavigation)
export default template
