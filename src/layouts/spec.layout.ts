import { html, raw, render } from 'fragtml'
import type { LayoutFunction } from '@domstack/static/types.js'
import { article } from './docs.layout.ts'
export const parentLayout = 'root'
const spec: LayoutFunction<Record<string, any>, string> = ({ children }) => {
  const { body, toc } = article(children, true)
  return render(
    html`<main id="main">
      <section class="section">
        <div class="container container-wide">
          <div
            class="docs-layout spec-layout"
            data-spec-app
            data-markdown="/silk/docs/source/spec/2026.md"
          >
            <aside
              class="docs-sidebar spec-sidebar"
              aria-label="Specification table of contents"
            >
              <div class="docs-sidebar-header">
                <div class="docs-sidebar-title">Silk Spec (2026)</div>
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
                  href="https://github.com/oro-computer/silk/blob/master/docs/spec/2026.md"
                  >Source on GitHub</a
                >
                · <a href="/silk/docs/source/spec/2026.md">View Markdown</a>
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>`,
  )
}
export default spec
