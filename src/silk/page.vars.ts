import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "product" as const,
  "title": "Silk · Oro Computer",
  "description": "Silk is a high performance general purpose programming language with formal verification built in. Silk targets computer systems, mobile / tablet devices, WASM / WASI runtimes, and the web.",
  "bodyClass": "site-dark product-page silk-product-page",
  "bodyAttrs": {},
  "product": "silk",
  "footerLabel": "Silk"
}

export default vars satisfies CheckedPageVars<typeof vars>
