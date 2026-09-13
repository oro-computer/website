import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import { collections, type Collection } from './lib/collections.ts'
import type { NavigationData } from './lib/docs.ts'
import { collectionIndex } from './lib/artifacts.ts'

export const dataDeps = ['navigation'] satisfies DataDeps<NavigationData>
const template: TemplateFunction<Record<string, unknown>, NavigationData> = ({ data }) =>
  (Object.keys(collections) as Collection[]).map(collection =>
    collectionIndex(collection, data.navigation[collection]),
  )
export default template
