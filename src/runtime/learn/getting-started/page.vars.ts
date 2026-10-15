import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "First Runtime App · Learn Oro Runtime",
  "description": "Build Field Notes: save and restore a local draft in a native desktop window, with complete files and verification steps.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page runtime-learn-page",
  "bodyAttrs": {},
  "product": "runtime",
  "footerLabel": "Learn Runtime",
  "chapter": {
    "label": "Chapter 1",
    "title": "First run",
    "links": [
      {
        "url": "/runtime/learn/",
        "label": "All chapters"
      },
      {
        "url": "/runtime/learn/project-layout/",
        "label": "Next"
      }
    ],
    "position": "1 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
