import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Project Layout · Learn Oro Runtime",
  "description": "Chapter 2 of Learn Oro Runtime: understand oro.toml, copy maps, bundled web files, and the project shape.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page runtime-learn-page",
  "bodyAttrs": {},
  "product": "runtime",
  "footerLabel": "Learn Runtime",
  "chapter": {
    "label": "Chapter 2",
    "title": "Project layout",
    "links": [
      {
        "url": "/runtime/learn/getting-started/",
        "label": "Previous"
      },
      {
        "url": "/runtime/learn/configuration/",
        "label": "Next"
      }
    ],
    "position": "2 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
