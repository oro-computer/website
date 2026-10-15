import type { CheckedPageVars } from '#lib/page-vars.ts'

const vars = {
  "layout": "learn" as const,
  "title": "Configuration · Learn Oro Runtime",
  "description": "Configure Field Notes and verify a local build-directory override using .ororc and oroc print-build-dir.",
  "bodyClass": "site-dark product-page learn-page learn-lesson-page runtime-learn-page",
  "bodyAttrs": {},
  "product": "runtime",
  "footerLabel": "Learn Runtime",
  "chapter": {
    "label": "Chapter 3",
    "title": "Configuration",
    "links": [
      {
        "url": "/runtime/learn/project-layout/",
        "label": "Previous"
      },
      {
        "url": "/runtime/learn/windows-and-messaging/",
        "label": "Next"
      }
    ],
    "position": "3 / 5"
  }
}

export default vars satisfies CheckedPageVars<typeof vars>
