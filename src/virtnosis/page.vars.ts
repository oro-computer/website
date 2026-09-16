import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "product" as const,
  "title": "Virtnosis · Oro Computer",
  "description": "Virtnosis is a read-only libvirt security analysis and diagnosis toolset built around a bounded local agent and an operator CLI.",
  "bodyClass": "site-dark product-page virtnosis-product-page",
  "bodyAttrs": {},
  "product": "virtnosis",
  "footerLabel": "Virtnosis"
}

export default vars satisfies CheckedPageVars<typeof vars>
