import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  layout: 'marketing' as const,
  title: 'Technology · Oro Computer',
  description:
    'Build native applications with Oro Runtime. Write systems software with Silk. Open tools for software that runs close to you.',
  bodyClass: 'home-page',
  bodyAttrs: {},
  product: '',
  footerLabel: '',
}

export default vars satisfies CheckedPageVars<typeof vars>
