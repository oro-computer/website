# Oro Website

Oro Computer's static website uses DOMStack to build marketing pages, learning
chapters, and documentation for Runtime, Silk, Virtnosis, Sage, and slg.

## Local development

Use Node 24. Builds, ingestion tools, audits, and tests run in TypeScript on Node;
Python is not required. No sibling checkout is needed to build the site.

```sh
npm ci
npm start
```

`npm start` builds, serves, and watches for changes. `npm run build` creates
`public/` from scratch. Generated HTML, search indexes, raw Markdown, and LLM packs
are output files; do not commit `public/`.

## Editing content

- `src/**/page.html`: authored page fragments, with metadata in `page.vars.ts`.
- `src/**/page.md`: public documentation, including YAML frontmatter.
- `src/layouts/`: shared page chrome, navigation, and progressive browser clients.
  `registry.ts` registers actual layout exports with DOMStack's type-only registry.
  HTML `page.vars.ts` companions use `CheckedPageVars` from `#lib/page-vars.ts`
  to validate supplied metadata against their layout chain and global vars during
  `npm run typecheck`; this adds no runtime registry or subscriptions.
- `src/globals/global.css`: shared Oro styles, based on `docs/branding/`.
  Homepage styles live in `src/style.css`; learn styles in `src/layouts/learn.layout.css`.
- `src/lib/`: rendering, URL, collection, and navigation helpers.
- `src/globals/global.vars.ts`: shared site configuration.
- `src/globals/global.data.ts`: a watch-session index keyed by DOMStack `sourceId`,
  caching validated document metadata, Markdown, and rendered search text. Navigation,
  search, and LLM-export views are derived from those cached entries.
- `src/layouts/docs.layout.ts`: the shared documentation renderer, consuming one
  lightweight navigation key for all collections.
- `src/{product}/llms.txt.template.ts`: product LLM packs; Silk includes its wiki.
- `src/{product}/docs/search.json.template.ts`: collection search indexes;
  the wiki uses `src/silk/wiki/`.
- `src/lib/docs-page-outputs.ts`: shared `pageOutputs` hook exported by the `docs`
  and `spec` layouts. Each page owns its raw Markdown export at its existing
  collection `source/` URL, using its `sourcePath`.
- `src/llms.txt.template.ts`, `sitemap.xml.template.ts`, `CNAME.template.ts`,
  and `nojekyll.template.ts`: site-wide artifacts.

Templates live beside their output locations. Single-file templates return strings
and use their filenames without `.template.ts` as output names. The root
`nojekyll.template.ts` explicitly names its hidden output `.nojekyll`.
Raw Markdown uses DOMStack page outputs instead of collection templates: body
edits update only that page's raw copy, and watch rebuilds retain unchanged copies
without rewriting them. Deleted pages and changed raw paths clean up owned files.
Navigation is rendered into HTML from global data; the legacy navigation
`index.json` endpoints are no longer generated.

Consult `docs/branding/` before changing visual design or copy tone. The approved
logo originals remain in `docs/branding/assets/`; their checked mirrors in `src/docs/branding/assets/` retain
the same public URLs. Update both when replacing an asset. Handlebars is disabled globally so literal `{{ ... }}` code
examples remain intact. The Markdown parser deliberately keeps the existing
plugin policy: tables, strikethrough, HTML, linkification, GitHub alerts, syntax
highlighting, and legacy heading IDs. DOMStack's other default extensions are
not implicitly enabled; review fragment and rendered-output compatibility before
adding plugins.

Each documentation page declares `description`, `docsCollection`, `section`,
`order`, `sourcePath`, `githubRepo`, and `githubRef`. Its first Markdown H1 is the
default title; do not repeat it in frontmatter. Preserve
`sourcePath`: it defines the stable raw Markdown endpoint and import identity.
The `start` document lives at its collection root; the specification lives at
`src/silk/spec/2026/page.md`. Order is explicit and does not depend on filenames.
New imported pages are appended; review their section and order after syncing.
DOMStack infers the first H1 as inline Markdown. `src/lib/titles.ts` converts that
value to plain text for document/social metadata, navigation, search titles, and
LLM-pack headings, while the article keeps its formatted heading and anchor.
An optional frontmatter `title` overrides the inferred title; use it only for an
intentional difference (inline Markdown is reduced to plain text there too).
An H1 edit changes navigation metadata, while a body edit below it does not.
Imports infer titles from H1s, retain explicit overrides, and use a filename
fallback only for new documents without an H1. Raw Markdown remains unchanged.

Use `layout: "docs"` for documentation pages in every collection (`spec` for the
specification). All docs share one lightweight navigation dependency: navigation
changes rebuild all docs, while body-only edits remain isolated to the changed
article, its raw output, and its collection's search and LLM exports. Search and
LLM artifacts retain separate, per-collection dependencies; raw outputs need none.

Use canonical directory links such as `/runtime/docs/guides/hello-world/`.
Collection roots redirect legacy `?p=` links while preserving fragments. Static
redirect pages retain Silk's old logger-guide and specification aliases. The
articles, sidebar, previous/next navigation, and ToC work without JavaScript;
search, tabs, copy controls, and Ask AI progressively enhance them.

### Incremental global data

DOMStack supplies private `previousState`, reset/delta `changes`, and
`setState()` to the data callback. Initial builds and resets process all documents;
watch deltas replace only `changes.upserted` entries and delete `changes.removed`
IDs. Pages leaving a docs collection retain only their route/redirect metadata.
The cache contains plain data, never page instances or renderers, and DOMStack
commits its snapshot only after a successful build. It does not persist across
watch sessions or change the clean-build/ingestion workflow.

Collection views are still rebuilt from cached document references, and existing
DOMStack fingerprints plus `dataDeps` remain the only downstream invalidation
system. There are no extra application hashes or changed-key declarations.
DOMStack also caches Markdown source preparation between watch builds, avoiding
repeated reads and H1 parsing for unchanged documents. Projection, state cloning,
and fingerprinting still have collection-wide costs. The standalone watcher test
measures the data callback's document reads/renders directly.

Dependency tracking has known limitations for package import aliases and static
re-exports (see [DOMStack #328](https://github.com/bcomnes/domstack/issues/328)). Restart the watcher after changing shared helpers
reached through `#lib/*` or re-exports, or inputs read outside tracked imports.
Editing `global.data.ts` itself resets the index; ordinary page edits are tracked.

### Redirects from old URLs

Follow the [DOMStack redirect-pages recipe](https://domstack.net/docs/cookbook/redirect-pages/):
keep old paths on the **destination page**, rather than in a separate route map.
For Markdown, add frontmatter:

```yaml
redirectFrom:
  - /old-guide/
  - /old-guide.html
```

HTML pages can declare the same array in their `page.vars.ts` object. Global data
validates and collects these aliases; `src/redirects.pages.ts` subscribes only to
`redirects` and renders each old URL through the existing `redirect` layout. The
target comes from the destination page's actual URL, so retained aliases follow
it when it moves. Removing an alias or destination removes its generated redirect
in watch mode. Body edits do not change the redirect collection.

Use same-origin paths beginning with `/`, with trailing `/` for directory URLs.
Queries, fragments, unsafe paths, duplicate aliases, and aliases colliding with
source pages are rejected. Choose paths that do not overlap assets or other
generated outputs. Redirect pages have a canonical target and a no-JavaScript
meta-refresh/fallback link; with JavaScript they preserve the incoming query and
fragment. These are static client-side redirects, not HTTP 301 responses.

Legacy `?p=` document IDs still use the separate client resolver; do not put them
in `redirectFrom`. Manual content imports preserve existing page metadata,
including aliases. The logger guide and specification now declare their old
paths this way without changing their Markdown bodies or raw exports.

## Blog

The blog at `/blog/` lists posts newest first. Start and publish posts with:

```sh
npm run new-blogpost -- --author bret "Post title"
npm run dev -- --drafts
npm run publish-draft -- post-title
# For a draft from an earlier year:
npm run publish-draft -- 2025/post-title
```

The create command scaffolds `src/blog/<current-year>/<slug>/page.draft.md` and
an `img/` directory. Replace the draft's summary and write the article before
publishing. The publish command sets `publishDate` to now and installs `page.md`
without overwriting an existing post, then removes the draft. It preserves the
article body and metadata values, but normalizes YAML formatting/comments.

You can also author Markdown posts and local images directly under
`src/blog/<year>/<slug>/`, using `page.md` for a published post:

```markdown
---
layout: blog
description: "A short summary for the index and feeds."
publishDate: "2026-09-18T12:00:00Z"
author: bret
---

# Your post title

Write the post here. Link local images with `./image.png`.
```

The H1 supplies the title, just like docs. Select an author from `src/lib/authors.ts`:
`joe` (Joseph Werle), `bret` (Bret Comnes), or `oro` (Oro Computer, the default).
Author names and profile links appear in bylines and both feeds. The create
command accepts `--author joe` or `--author bret`; unknown IDs fail validation.
`updatedDate` is optional and must not precede `publishDate`. Quote date values
and include a timezone. Publication dates control ordering, not scheduling:
future-dated published files are still public.

Use `page.draft.md` while writing and preview with `npm run dev -- --drafts`.
Normal builds omit draft pages. Drafts appear in the preview index but never in
feeds; files and images in a draft directory are not private, so do not commit
sensitive material. Rename to `page.md` to publish without resetting its date, or
use the publish command to set it to now. The initial published post is
`src/blog/2026/hello-world/page.md`.

`/feed.json` (JSON Feed 1.1) and `/feed.xml` (Atom) contain the latest 20 published
posts with full HTML, stable URL-based IDs, authors, and update dates. Feed links
and image sources are absolute. Every HTML page advertises both feeds. Empty
feeds are valid and deterministic; Atom uses the Unix epoch until a post exists.

Blog data shares the incremental global-data index. Body edits refresh the post
and feeds; the index subscribes only to summaries, and docs navigation is
independent. Posts use `layout: blog`; the listing uses `blog-index`. Both inherit
`root`, keeping site chrome shared. `src/blog/archives.pages.ts` generates each
`/blog/<year>/` archive from the posts in that year directory, with no hand-authored
index needed. Archives link from the main index and post breadcrumbs and appear
in the sitemap. Publishing an older-year draft keeps it in its original year
archive even when its publication date is newer. Removing the last post from a
year removes that archive during watch builds.

Every page has an **Edit this page** footer link to its source in GitHub, matching
the repository browser/edit workflow. Generated redirect pages link to the
source page that declares their alias, rather than a nonexistent output file.

## Refreshing upstream content

Ingestion is separate from building and CI. These commands read explicit upstream
checkouts, preserve the established curated/website-owned content, and write
committed DOMStack Markdown pages. Review and commit their changes before deploying.

```sh
node silk/tools/sync-from-silk-docs.ts --silk-repo /path/to/silk
node runtime/tools/generate-js-api-reference.ts --runtime-repo /path/to/runtime
npm run build
npm run audit
npm run audit:content
```

The defaults use adjacent `silk` and `runtime` directories, independent of the
website checkout's name. Silk's legacy `--repo-root` workspace option is retained.
The tools stage flat Markdown temporarily, apply the existing ownership and
pruning rules, then import it through `tools/import-public.ts`. Shared normalization
and reference-linking helpers live in `tools/ingestion/`. Public-copy normalization
runs during ingestion, never during rendering; fenced examples
are preserved. Unchanged staged pages keep their exact Markdown and metadata;
linked API headings become plain-text titles when a page changes. The reference
catalog includes new pages in the same import batch. Runtime's generated
reference markers retain surrounding prose.

The generators call the TypeScript importer directly; they never run during a
DOMStack build. Search indexes and LLM exports are DOMStack templates, not ingestion
outputs. Content audits derive document IDs and expected raw filenames from committed
Markdown frontmatter, then inspect the generated files in `public/` by default.
They do not depend on public navigation JSON. Set `ORO_SITE_OUTPUT` to inspect
another output directory. Set `ORO_RUNTIME_REPO` explicitly to additionally audit
against a particular upstream Runtime checkout; ordinary checks are independent
of whatever happens to be checked out next door.

## Validation

Install the browser once, then run the same complete gate used by both CI and
Pages deployment:

```sh
npx playwright install chromium
npm run check
```

Individual checks are also available:

```sh
npm run typecheck
npm test
npm run build
npm run audit
npm run audit:content
npm run test:site
npx playwright install chromium
npm run test:browser
npm run test:tooling
npm run test:reproducibility
```

The crawler checks every generated internal link and fragment. Site tests cover
all original 27 HTML routes and 585 documentation routes, raw-source parity,
search text, and LLM packs. Browser tests cover desktop/mobile layouts,
no-JavaScript rendering, compatibility redirects, search, tabs, copy controls,
Ask AI, specification heading search, and fragments inside tabs. Tooling tests
verify all current documents survive unchanged imports and that a renamed standalone
checkout rebuilds articles and exports during development. To use an existing Chromium install,
set `ORO_BROWSER_EXECUTABLE` to its executable path.

`tests/fixtures/legacy-routes.json` records the original HTML and raw-document
endpoints as a fixed compatibility baseline. Keep it independent of the current
source inventory so deleting a page cannot silently erase its compatibility check.
When intentionally retiring routes, update the relevant assertions and redirects
together. The one-time converter and migration report remain available in Git history.

## Deployment and dependency updates

Pull requests run the Docs Audit workflow. Production-branch pushes run the
Pages workflow, which validates once, uploads that checked `public/` artifact,
and deploys with the Pages environment. Both workflows use Node only and retain
browser failure artifacts.
The repository's **Settings → Pages → Source** must be **GitHub Actions**. Merging
these changes does not itself change that repository setting. The output contains
`CNAME`, `.nojekyll`, branding assets, raw Markdown, and `llms.txt` packs.

DOMStack is pinned to an exact beta version in `package.json` and the committed
lockfile; CI uses `npm ci` for reproducible installs. To refresh to the current
beta, run `npm install --save-dev --save-exact @domstack/static@beta`, run the
complete validation sequence, and compare representative desktop and mobile
screenshots. Commit both `package.json` and `package-lock.json`.
