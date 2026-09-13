# DOMStack migration status

The repository implementation now builds the entire Oro website with
`@domstack/static@beta`. The lockfile records the resolved beta so `npm ci`
remains reproducible. Production cutover is complete; deployment evidence is recorded below.

## Implemented

| Area | Result |
| --- | --- |
| Authored pages | All 27 original HTML routes use shared DOMStack layouts. |
| Documentation | 585 Markdown articles generate complete static HTML, including the Silk specification. |
| Compatibility | Original collection roots, all valid legacy document IDs, aliases, fragments, and raw Markdown endpoints are retained. |
| Page chrome | Headers, footers, metadata, product navigation, learn chapter bars, documentation sidebars, breadcrumbs, previous/next links, and heading lists render at build time. |
| Progressive features | Search, keyboard tabs, copy controls, Ask AI, mobile sidebar controls, active headings, and tab fragments work with browser JavaScript. |
| Artifacts | One build emits HTML, indexes, search data, raw Markdown, LLM packs, the sitemap, CNAME, and `.nojekyll`. |
| Ingestion | Native TypeScript tools retain Silk and Runtime upstream/editorial ownership rules and explicit checkout paths. Unchanged public pages retain exact Markdown and metadata. |
| Cleanup | The browser Markdown renderers, vendored rendering libraries, old HTML shells, duplicate Python exporters, generated source-tree indexes, and Jekyll configuration are retired. |
| CI | Node 24 runs ingestion, audits, browser serving, and the `npm run check` gate without Python. Pull requests validate in Docs Audit; production pushes validate and deploy the same artifact in Pages, without a duplicate push audit. |

Collection layouts subscribe to lightweight, collection-specific navigation keys.
Search and raw-source/LLM templates have separate dependencies, so document-body
edits do not invalidate unrelated navigation consumers. Shared article transforms
remain page-local rather than storing rendered articles in global data. Markdown
keeps the existing alerts, highlighting, and legacy heading-ID policy; enabling
additional DOMStack Markdown plugins is an explicit compatibility decision.
Homepage and learn styles are scoped to their consumers, and progressive clients
are TypeScript modules rather than unchecked global initializers.

The route inventory is in `tools/migration/baseline.json`; original Markdown
links and heading text are in `tools/migration/link-inventory.json`. The migration
utility can reconstruct the initial conversion from a legacy checkout. It is
not part of ordinary builds or content refreshes.

## Acceptance checks

`npm run check` runs:

1. TypeScript checks and regression tests, including upstream ownership,
   linked-heading metadata, references between newly imported pages, literal
   double braces, and byte-for-byte round trips for all 585 public documents.
2. A clean static build and a crawl of every generated internal link and
   fragment, including duplicate-ID and empty-metadata checks.
3. The retained Runtime, Silk, wiki, stdlib, Virtnosis, Sage, and slg content audits.
4. Static-output tests for route parity, metadata, raw Markdown, search text,
   LLM packs, and branding assets.
5. Desktop/mobile browser checks for no-JavaScript reading and progressive features.
6. A standalone-checkout watch test that changes Markdown and verifies updated
   articles, navigation, search, raw Markdown, and LLM output.
7. A second build that must produce identical files without changing sources.

Desktop and mobile screenshots of the homepage, Runtime overview and learn page,
Runtime and Silk docs, and Silk specification were reviewed during implementation.
The original Oro styles and branding remain in use. Documentation now has static
heading navigation and collapsible mobile navigation.

## Production cutover

Production switched to GitHub Actions on September 13, 2026, retaining the
`oro.computer` custom domain. Both Docs Audit and [Deploy GitHub Pages](https://github.com/oro-computer/website/actions/runs/34767383445)
passed for commit `17325b8798b8fcbe66f8d9a34434e66d332c284c`.

The concurrent legacy Pages run failed because Jekyll interpreted literal code
braces as Liquid syntax. Changing the repository Pages build type from `legacy`
to `workflow` removes that obsolete build path.

Live HTTP checks returned 200 for the homepage, Runtime hello-world article,
legacy collection query URL, Silk specification, raw hello-world Markdown, and
Runtime LLM pack. The static article includes its heading in the initial HTML,
and the collection root includes legacy redirect data. Redirect execution and
fragment behavior were tested locally; the live checks covered HTTP responses
and content rather than a complete browser acceptance run.

Future deployments use `.github/workflows/pages.yml`: validate the committed
sources, upload `public/`, and deploy through the `github-pages` environment.
