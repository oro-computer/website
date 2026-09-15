import type {
  LayoutChain,
  LayoutProvidedVars,
  PageForLayout,
  ValidatePageVars,
} from '@domstack/static/types.js'
import type { CheckedPageVars } from '../src/lib/page-vars.ts'
import type globalVars from '../src/globals/global.vars.ts'
import type home from '../src/page.vars.ts'
import type lesson from '../src/runtime/learn/getting-started/page.vars.ts'
import type { DocVars, NavigationData } from '../src/lib/docs.ts'

// Typecheck-only: these assertions import no renderers or page companions at runtime.
type Assert<T extends true> = T
type IsNever<T> = [T] extends [never] ? true : false
type Equal<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false

type HomeVars = Assert<Equal<CheckedPageVars<typeof home>, typeof home>>
type LessonVars = Assert<Equal<CheckedPageVars<typeof lesson>, typeof lesson>>
type LearnChain = Assert<Equal<LayoutChain<'learn'>, readonly ['root', 'learn']>>
type DocsChain = Assert<Equal<LayoutChain<'docs'>, readonly ['root', 'docs']>>
type SpecChain = Assert<Equal<LayoutChain<'spec'>, readonly ['root', 'spec']>>

type MissingTitle = Assert<IsNever<CheckedPageVars<Omit<typeof home, 'title'>>>>
type MissingProduct = Assert<IsNever<CheckedPageVars<Omit<typeof lesson, 'product'>>>>
type UnknownLayout = Assert<IsNever<CheckedPageVars<{ layout: 'unknown'; title: string }>>>
type MissingGlobals = Assert<IsNever<ValidatePageVars<'marketing', typeof home>>>
type InvalidGlobalOverride = Assert<IsNever<CheckedPageVars<typeof home & { siteUrl: number }>>>
type InvalidChapter = Assert<IsNever<CheckedPageVars<
  Omit<typeof lesson, 'chapter'> & { chapter: { label: string } }
>>>
type MissingRedirect = Assert<IsNever<CheckedPageVars<{ layout: 'redirect'; title: string }>>>

// A data subscription is not a supplied render var, and render data stays in `data`.
type DocsVars = DocVars & { layout: 'docs' }
type DocsVarsValid = Assert<Equal<CheckedPageVars<DocsVars>, DocsVars>>
type SubscriptionIsNotDefault = Assert<Equal<LayoutProvidedVars<'docs'>, {}>>
type DocsPage = PageForLayout<'docs', DocsVars, NavigationData, typeof globalVars>
type DocsParams = Parameters<DocsPage>[0]
type NavigationInData = Assert<Equal<DocsParams['data'], NavigationData>>
type NoDataInVars = Assert<Equal<Extract<keyof DocsParams['vars'], 'navigation' | 'dataDeps'>, never>>
type SubscriptionCannotSupplyProduct = Assert<IsNever<CheckedPageVars<
  Omit<typeof lesson, 'product'> & { dataDeps: ['product'] }
>>>
type SubscriptionCannotBeGlobal = Assert<IsNever<ValidatePageVars<
  'marketing', typeof home, typeof globalVars & { dataDeps: ['navigation'] }
>>>
