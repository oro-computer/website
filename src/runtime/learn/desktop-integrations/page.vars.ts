import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Desktop Integrations · Learn Oro Runtime",
  "description": "Chapter 5 of Learn Oro Runtime: add notifications, clipboard actions, and a native application menu.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page runtime-learn-page",
  "bodyAttrs": {},
  "product": "runtime",
  "footerLabel": "Learn Runtime",
  "chapter": {
    "label": "Chapter 5",
    "title": "Desktop integrations",
    "links": [
      {
        "url": "/runtime/learn/windows-and-messaging/",
        "label": "Previous"
      },
      {
        "url": "/runtime/docs/guides/secure-storage-and-sessions/",
        "label": "Docs"
      }
    ],
    "position": "5 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
