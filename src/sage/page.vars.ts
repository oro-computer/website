import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "product" as const,
  "title": "Sage · Oro Computer",
  "description": "Sage is a fast, ergonomic terminal pager for files, directories, stdin, and remote content, with syntax highlighting and a robust JavaScript plugin API.",
  "bodyClass": "",
  "bodyAttrs": {},
  "product": "sage",
  "footerLabel": "Sage"
}

export default vars satisfies CheckedPageVars<typeof vars>
