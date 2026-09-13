# Oro Website

Oro Computer's static website uses DOMStack to build marketing pages, learning
chapters, and documentation for Runtime, Silk, Virtnosis, Sage, and slg.

## Local development

Use Node 24. Builds, ingestion tools, audits, and tests run in TypeScript on Node;
Python is not required. No sibling checkout is needed to build the site.

```sh
npm ci
npm run dev
```

`npm run build` creates `public/` from scratch. `npm run preview` builds and serves
that same artifact. Generated HTML, search indexes, raw Markdown, and LLM packs
are output files; do not commit `public/`.

## Editing content

- `src/**/page.html`: authored page fragments, with metadata in `page.vars.ts`.
- `src/**/page.md`: public documentation, including YAML frontmatter.
- `src/layouts/`: shared page chrome, navigation, and progressive browser clients.
- `src/globals/global.css`: shared Oro styles, based on `docs/branding/`.
  Homepage styles live in `src/style.css`; learn styles in `src/layouts/learn.layout.css`.
- `src/lib/`: rendering, URL, collection, and navigation helpers.
- `src/global.data.ts`: validated collection metadata and precomputed navigation,
  search, and source-export projections derived from source pages.
- `src/layouts/docs.layout.ts`: the shared documentation renderer, consuming one
  lightweight navigation key for all collections.
- `src/navigation.template.ts`: navigation indexes for all collections.
- `src/*-{search,sources,llms}.template.ts`: dependency-scoped collection
  artifacts; `src/sitemap.template.ts`: sitemap output;
  `src/artifacts.template.ts`: site-wide LLM directory and `.nojekyll`.

Consult `docs/branding/` before changing visual design or copy tone. The approved
logo originals remain in `docs/branding/assets/`; their checked mirrors in `src/docs/branding/assets/` retain
the same public URLs. Update both when replacing an asset. Handlebars is disabled globally so literal `{{ ... }}` code
examples remain intact. The Markdown parser deliberately keeps the existing
plugin policy: tables, strikethrough, HTML, linkification, GitHub alerts, syntax
highlighting, and legacy heading IDs. DOMStack's other default extensions are
not implicitly enabled; review fragment and rendered-output compatibility before
adding plugins.

Each documentation page declares `title`, `description`, `docsCollection`,
`section`, `order`, `sourcePath`, `githubRepo`, and `githubRef`. Preserve
`sourcePath`: it defines the stable raw Markdown endpoint and import identity.
The `start` document lives at its collection root; the specification lives at
`src/silk/spec/2026/page.md`. Order is explicit and does not depend on filenames.
New imported pages are appended; review their section and order after syncing.
Use `layout: "docs"` for documentation pages in every collection (`spec` for the
specification). All docs share one lightweight navigation dependency: navigation
changes rebuild all docs, while body-only edits remain isolated to the changed
article and its collection's search and exports. Search and raw-source/LLM
artifacts retain separate, per-collection dependencies.

Use canonical directory links such as `/runtime/docs/guides/hello-world/`.
Collection roots redirect legacy `?p=` links while preserving fragments. Static
redirect pages retain Silk's old logger-guide and specification aliases. The
articles, sidebar, previous/next navigation, and ToC work without JavaScript;
search, tabs, copy controls, and Ask AI progressively enhance them.

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
pruning rules, then import it through `tools/import-public.ts`. Public-copy
normalization runs during ingestion, never during rendering; fenced examples
are preserved. Unchanged staged pages keep their exact Markdown and metadata;
linked API headings become plain-text titles when a page changes. The reference
catalog includes new pages in the same import batch. Runtime's generated
reference markers retain surrounding prose.

The generators call the TypeScript importer directly; they never run during a
DOMStack build. JSON indexes and LLM exports are DOMStack templates, not ingestion
outputs. Content audits run through `tools/audit-content.ts` and inspect `public/`
by default; set `ORO_SITE_OUTPUT` to inspect
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
verify all 585 pages survive unchanged imports and that a renamed standalone
checkout rebuilds articles and exports during development. To use an existing Chromium install,
set `ORO_BROWSER_EXECUTABLE` to its executable path.

`tools/migration/migrate.ts /path/to/legacy-checkout` records the original route
inventory and performs the deterministic initial conversion. It is a migration
utility, not a routine content refresh command. Keep `tools/migration/baseline.json`
as the compatibility fixture. See [migration status and cutover](docs/migration.md). When intentionally retiring or adding routes,
update the relevant assertions and redirects together.

## Deployment and dependency updates

Pull requests run the Docs Audit workflow. Production-branch pushes run the
Pages workflow, which validates once, uploads that checked `public/` artifact,
and deploys with the Pages environment. Both workflows use Node only and retain
browser failure artifacts.
The repository's **Settings → Pages → Source** must be **GitHub Actions**. Merging
these changes does not itself change that repository setting. The output contains
`CNAME`, `.nojekyll`, branding assets, raw Markdown, and `llms.txt` packs.

DOMStack uses the **beta** distribution tag in `package.json`. The committed
lockfile records the resolved version, and CI uses `npm ci` for reproducible
installs. To refresh to the current beta, run `npm update @domstack/static`,
commit the updated lockfile, run the complete validation sequence, and compare
representative desktop and mobile screenshots.
