import type { DataDeps, PagesForLayout } from '@domstack/static/types.js'
import type globalVars from './globals/global.vars.ts'
import type {} from './layouts/registry.ts'
import type { DocsData } from '#lib/docs.ts'
import { redirectOutputName } from '#lib/redirects.ts'

type RedirectData = Pick<DocsData, 'redirects'>
export const dataDeps = ['redirects'] satisfies DataDeps<RedirectData>

const redirects: PagesForLayout<
  'redirect',
  { title: string; description: string; redirect: string; editSource: string },
  typeof globalVars,
  RedirectData,
  Record<string, never>
> = ({ data }) => data.redirects.map(({ from, to, source }) => ({
  outputName: redirectOutputName(from),
  vars: {
    layout: 'redirect',
    title: 'Redirecting…',
    description: 'This page has moved.',
    redirect: to,
    editSource: source,
  },
  children: '',
}))

export default redirects
