import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "product" as const,
  "title": "Oro Runtime · Oro Computer",
  "description": "Oro Runtime turns web projects into native applications with project configuration, packaging, service workers, windows, files, and updates.",
  "bodyClass": "site-dark product-page runtime-product-page",
  "bodyAttrs": {},
  "product": "runtime",
  "footerLabel": "Oro Runtime"
}

export default vars satisfies CheckedPageVars<typeof vars>
