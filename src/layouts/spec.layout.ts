import { html, raw, render } from 'fragtml'
import type { LayoutFunction } from '@domstack/static/types.js'
import { article } from '../lib/rendering.ts'
import { collections } from '../lib/collections.ts'
import { rawUrl, type DocVars } from '../lib/docs.ts'
export const parentLayout = 'root'
type SpecVars = DocVars & { specLabel?: string }
const spec: LayoutFunction<SpecVars, string> = ({ vars: v, children }) => {
  const { body, toc } = article(children, true)
  const markdownUrl = rawUrl({ collection: v.docsCollection, sourcePath: v.sourcePath })
  const year = v.sourcePath.match(/(?:^|\/)(\d{4})\.(?:md|txt)$/)?.[1]
  const productLabel = collections[v.docsCollection].title.replace(/ (?:Docs|Wiki)$/, '')
  const label = v.specLabel ?? (year ? `${productLabel} Spec (${year})` : v.title)
  const upstreamPath = v.sourcePath.split('/').map(encodeURIComponent).join('/')
  const upstreamUrl = `https://github.com/${v.githubRepo}/blob/${encodeURIComponent(v.githubRef)}/docs/${upstreamPath}`
  return render(
    html`<main id="main">
      <section class="section">
        <div class="container container-wide">
          <div
            class="docs-layout spec-layout"
            data-spec-app
            data-markdown="${markdownUrl}"
          >
            <aside
              class="docs-sidebar spec-sidebar"
              aria-label="Specification table of contents"
            >
              <div class="docs-sidebar-header">
                <div class="docs-sidebar-title">${label}</div>
                <input
                  class="docs-search"
                  type="search"
                  autocomplete="off"
                  placeholder="Search headings…"
                  aria-label="Search specification headings"
                  data-spec-search
                  hidden
                />
              </div>
              <nav class="spec-toc-wrap" data-spec-toc>${raw(toc)}</nav>
            </aside>
            <article class="docs-content spec-content">
              <div class="prose spec-prose" data-spec-content>${raw(body)}</div>
              <p>
                <a
                  href="${upstreamUrl}"
                  >Source on GitHub</a
                >
                · <a href="${markdownUrl}">View Markdown</a>
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>`,
  )
}
export default spec
