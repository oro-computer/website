import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Windows and Messaging · Learn Oro Runtime",
  "description": "Open and reuse a native draft preview, using a ready-message handshake before sending content.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page runtime-learn-page",
  "bodyAttrs": {},
  "product": "runtime",
  "footerLabel": "Learn Runtime",
  "chapter": {
    "label": "Chapter 4",
    "title": "Windows and messaging",
    "links": [
      {
        "url": "/runtime/learn/configuration/",
        "label": "Previous"
      },
      {
        "url": "/runtime/learn/desktop-integrations/",
        "label": "Next"
      }
    ],
    "position": "4 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
