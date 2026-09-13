import type { DataDeps, LayoutFunction } from '@domstack/static/types.js'
import type { DocVars, DocsData } from '../lib/docs.ts'
import { renderDocs } from './docs.layout.ts'
export const parentLayout = 'docs'
export const dataDeps = ['virtnosisNavigation'] satisfies DataDeps<Pick<DocsData, 'virtnosisNavigation'>>
// DOMStack beta.5 reads layout subscriptions from vars.
export const vars = { dataDeps }
const layout: LayoutFunction<DocVars, string, string, Pick<DocsData, 'virtnosisNavigation'>> = ({ vars, children, data }) =>
  renderDocs(vars, children, data.virtnosisNavigation)
export default layout
