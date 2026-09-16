import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  layout: 'marketing' as const,
  title: 'Technology · Oro Computer',
  description:
    'Oro Computer builds edge software foundations for humans and AI agents through Oro Runtime, Silk, and Virtnosis.',
  bodyClass: 'editorial-layout',
  bodyAttrs: {},
  product: '',
  footerLabel: '',
}

export default vars satisfies CheckedPageVars<typeof vars>
