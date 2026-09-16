import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Language Tour · Learn Silk",
  "description": "Chapter 2 of Learn Silk: read bindings, functions, control flow, optionals, and small result-oriented APIs.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page silk-learn-page",
  "bodyAttrs": {},
  "product": "silk",
  "footerLabel": "Learn Silk",
  "chapter": {
    "label": "Chapter 2",
    "title": "Language tour",
    "links": [
      {
        "url": "/silk/learn/getting-started/",
        "label": "Previous"
      },
      {
        "url": "/silk/learn/modules-and-packages/",
        "label": "Next"
      }
    ],
    "position": "2 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
