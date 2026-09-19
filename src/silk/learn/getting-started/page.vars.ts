import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "First Silk Program · Learn Silk",
  "description": "Chapter 1 of Learn Silk: write a small Silk program, import stdlib I/O, and run silk check, test, and build.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page silk-learn-page",
  "bodyAttrs": {},
  "product": "silk",
  "footerLabel": "Learn Silk",
  "chapter": {
    "label": "Chapter 1",
    "title": "First program",
    "links": [
      {
        "url": "/silk/learn/",
        "label": "All chapters"
      },
      {
        "url": "/silk/learn/language-tour/",
        "label": "Next"
      }
    ],
    "position": "1 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
