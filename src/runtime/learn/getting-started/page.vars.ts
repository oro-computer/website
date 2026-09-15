import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "First Runtime App · Learn Oro Runtime",
  "description": "Chapter 1 of Learn Oro Runtime: create a project, edit the first page, use oro:application, and run the app.",
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
