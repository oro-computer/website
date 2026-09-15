import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Learn Silk · Oro Computer",
  "description": "A guided Silk learning path for first programs, modules, packages, stdlib APIs, C ABI surfaces, and Formal Silk.",
  "bodyClass": "site-dark product-page learn-page silk-learn-page",
  "bodyAttrs": {},
  "product": "silk",
  "footerLabel": "Learn Silk"
}

export default vars satisfies CheckedPageVars<typeof vars>
