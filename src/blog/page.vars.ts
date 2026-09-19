import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "marketing" as const,
  "title": "Blog · Oro Computer",
  "description": "The Oro Computer blog is coming soon.",
  "bodyClass": "site-dark blog-page",
  "bodyAttrs": {},
  "product": "blog",
  "footerLabel": "Oro Computer Blog"
}

export default vars satisfies CheckedPageVars<typeof vars>
