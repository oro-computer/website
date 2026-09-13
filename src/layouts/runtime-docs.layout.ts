import type { DataDeps, LayoutFunction } from '@domstack/static/types.js'
import type { DocVars, DocsData } from '../lib/docs.ts'
import { renderDocs } from './docs.layout.ts'
export const parentLayout = 'docs'
export const dataDeps = ['runtimeNavigation'] satisfies DataDeps<Pick<DocsData, 'runtimeNavigation'>>
// DOMStack beta.5 reads layout subscriptions from vars.
export const vars = { dataDeps }
const layout: LayoutFunction<DocVars, string, string, Pick<DocsData, 'runtimeNavigation'>> = ({ vars, children, data }) =>
  renderDocs(vars, children, data.runtimeNavigation)
export default layout
