import type { DataDeps, LayoutFunction } from '@domstack/static/types.js'
import type { DocVars, DocsData } from '../lib/docs.ts'
import { renderDocs } from './docs.layout.ts'
export const parentLayout = 'docs'
export const dataDeps = ['silkNavigation'] satisfies DataDeps<Pick<DocsData, 'silkNavigation'>>
// DOMStack beta.5 reads layout subscriptions from vars.
export const vars = { dataDeps }
const layout: LayoutFunction<DocVars, string, string, Pick<DocsData, 'silkNavigation'>> = ({ vars, children, data }) =>
  renderDocs(vars, children, data.silkNavigation)
export default layout
