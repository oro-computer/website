import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Learn Oro Runtime · Oro Computer",
  "description": "A guided Oro Runtime learning path for first runs, project layout, native capabilities, service workers, packaging, and updates.",
  "bodyClass": "site-dark product-page learn-page runtime-learn-page",
  "bodyAttrs": {},
  "product": "runtime",
  "footerLabel": "Learn Runtime"
}

export default vars satisfies CheckedPageVars<typeof vars>
