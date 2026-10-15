import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Types and Optionals · Learn Silk",
  "description": "Represent customers with optional email addresses and test the receipt fallback.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page silk-learn-page",
  "bodyAttrs": {},
  "product": "silk",
  "footerLabel": "Learn Silk",
  "chapter": {
    "label": "Chapter 4",
    "title": "Types and optionals",
    "links": [
      {
        "url": "/silk/learn/modules-and-packages/",
        "label": "Previous"
      },
      {
        "url": "/silk/learn/results-and-errors/",
        "label": "Next"
      }
    ],
    "position": "4 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
