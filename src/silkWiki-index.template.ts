import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { DocsData } from './lib/docs.ts'
import { collectionIndex } from './lib/artifacts.ts'
export const dataDeps = ['silkWikiNavigation'] satisfies DataDeps<Pick<DocsData, 'silkWikiNavigation'>>
const template: TemplateFunction<Record<string, unknown>, Pick<DocsData, 'silkWikiNavigation'>> = ({ data }) => collectionIndex('silkWiki', data.silkWikiNavigation)
export default template
