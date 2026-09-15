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
| Artifacts | One build emits HTML, search indexes, raw Markdown, LLM packs, the sitemap, CNAME, and `.nojekyll`. Legacy navigation JSON exports are retired. |
| Ingestion | Native TypeScript tools retain Silk and Runtime upstream/editorial ownership rules and explicit checkout paths. Unchanged public pages retain exact Markdown and metadata. |
| Cleanup | The browser Markdown renderers, vendored rendering libraries, old HTML shells, duplicate Python exporters, generated source-tree indexes, and Jekyll configuration are retired. |
| CI | Node 24 runs ingestion, audits, browser serving, and the `npm run check` gate without Python. Pull requests validate in Docs Audit; production pushes validate and deploy the same artifact in Pages, without a duplicate push audit. |

All six documentation collections use the single `docs` layout; the Silk
specification retains `spec`. The `docs` layout subscribes to one shared,
lightweight navigation key covering all collections. Navigation changes rebuild
all docs. Body-only edits update the changed article and its page-owned raw copy,
plus its collection's search and LLM templates, which retain per-collection
dependencies. DOMStack 12.0.0-beta.6 supplies the `pageOutputs` hook shared by
`docs` and `spec`; no collection subscription is needed for raw exports. Watch
rebuilds skip unchanged raw writes and clean up removed or renamed outputs.
Global data still processes all documents for search; this change narrows output
writes, not that computation. Ingestion remains separate from building.
Shared article transforms remain page-local rather than storing rendered articles
in global data. Markdown keeps the existing alerts, highlighting, and legacy
heading-ID policy; enabling
additional DOMStack Markdown plugins is an explicit compatibility decision.
Homepage and learn styles are scoped to their consumers, and progressive clients
are TypeScript modules rather than unchecked global initializers.

Artifact templates are co-located with their output directories: product
`llms.txt.template.ts` files and collection `search.json.template.ts` files.
The former six `source/sources.template.ts` exporters are replaced by the shared
`src/lib/docs-page-outputs.ts` hook, with each source page owning its raw output.
The wiki uses `src/silk/wiki/`; other collections use `src/{product}/docs/`.
Navigation remains in global data for HTML rendering, not as public `index.json`
exports. Content audits read committed Markdown metadata for document IDs and
expected raw exports. Single-file outputs use the template filename without `.template.ts`;
raw page outputs use destination-root paths derived from collection metadata and
`sourcePath`, preserving public URLs and Markdown bytes with frontmatter stripped. Site-wide `llms.txt`, sitemap, CNAME, and `.nojekyll` templates
remain at the source root, with an explicit hidden-output name for `.nojekyll`.

The route inventory is in `tools/migration/baseline.json`; original Markdown
links and heading text are in `tools/migration/link-inventory.json`. The migration
utility can reconstruct the initial conversion from a legacy checkout. It is
not part of ordinary builds or content refreshes.

HTML page companions now validate their supplied vars with DOMStack's type-only
layout registry and `ValidatePageVars`, via `CheckedPageVars`. The registry
references actual renderer, parent, and default exports for all seven layouts;
it does not alter runtime discovery, rendering, or subscriptions. Markdown
frontmatter continues to use runtime metadata validation rather than per-page
TypeScript companions.

Path redirects follow the DOMStack `redirectFrom` cookbook pattern: old paths
live in destination-page metadata, global data validates a separate redirects
projection, and a typed pages factory uses the existing redirect layout. The
logger-guide and specification aliases now use this path; legacy `?p=` links
retain their query-aware client resolver. Alias changes and destination moves
update generated pages, while body-only edits leave redirects untouched.

All 585 documentation pages now use their Markdown H1 as the default title,
removing redundant frontmatter titles without changing article bodies. Because
DOMStack beta.6 infers raw inline Markdown, shared title helpers reduce it to
plain text at metadata consumers and in ingestion. Formatted H1s and anchors
remain unchanged; intentional frontmatter overrides remain supported. This also
removes stale link syntax from 31 metadata titles. Imports no longer regenerate
redundant title fields and preserve explicit overrides during upstream refreshes.

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
