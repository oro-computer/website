import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "product" as const,
  "title": "slg · Oro Computer",
  "description": "slg is a fast recursive line grep utility for files and directories, with rg/ag-style workflows, explicit ignore controls, and tunable parallel traversal.",
  "bodyClass": "",
  "bodyAttrs": {},
  "product": "slg",
  "footerLabel": "slg"
}

export default vars satisfies CheckedPageVars<typeof vars>
