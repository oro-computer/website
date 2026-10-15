import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Results and Errors · Learn Silk",
  "description": "Validate a shipping choice from the command line, handle Result values, and verify success and failure exit codes.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page silk-learn-page",
  "bodyAttrs": {},
  "product": "silk",
  "footerLabel": "Learn Silk",
  "chapter": {
    "label": "Chapter 5",
    "title": "Results and errors",
    "links": [
      {
        "url": "/silk/learn/types-and-optionals/",
        "label": "Previous"
      },
      {
        "url": "/silk/docs/language/structs-impls-layout/",
        "label": "Docs"
      }
    ],
    "position": "5 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
