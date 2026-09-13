import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { collectionIndex } from './lib/artifacts.ts'
export const dataDeps = ['sageNavigation'] satisfies DataDeps<Pick<DocsData, 'sageNavigation'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'sageNavigation'>> = ({ data }) => collectionIndex('sage', data.sageNavigation)
export default template
