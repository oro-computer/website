import { html, raw, render } from 'fragtml'
import { article } from '../lib/rendering.ts'
import type { LayoutFunction } from '@domstack/static/types.js'
import {
  collections,
  sectionTitle,
} from '../lib/collections.ts'
import { rawUrl, type DocLink, type Navigation, type DocVars } from '../lib/docs.ts'
export const parentLayout = 'root'
// Asset-bearing parent: collection wrappers render the documentation shell.
const docsLayout: LayoutFunction<Record<string, unknown>, string> = ({ children }) => children
function prevNext(doc: DocLink | null, label: string): string {
  return doc
    ? render(
        html`<a class="docs-prevnext-link" href="${doc.url}"
          ><span class="docs-prevnext-label">${label}</span
          ><span class="docs-prevnext-title">${doc.title}</span></a
        >`,
      )
    : ''
}
export function renderDocs(v: DocVars, children: string, navigation: Navigation): string {
  const c = collections[v.docsCollection]
  const doc = navigation.bySource[v.sourcePath]
  if (!doc) throw new Error(`Missing navigation document: ${v.docsCollection}/${v.sourcePath}`)
  const sections = navigation.sections
  const { body, toc } = article(children)
  const legacy = doc.id === 'start' ? JSON.stringify(navigation.legacy) : ''
  return render(
    html`<main id="main">
      <section class="section">
        <div class="container">
          <div
            class="docs-layout"
            data-docs-app
            data-has-toc="true"
            data-search="${c.base}search.json"
            data-markdown="${rawUrl(doc)}"
          >
            <aside class="docs-sidebar" aria-label="Documentation navigation">
              <div class="docs-sidebar-header">
                <div class="docs-sidebar-title">${c.title}</div>
                <input
                  class="docs-search"
                  type="search"
                  autocomplete="off"
                  placeholder="Search…"
                  aria-label="Search documentation"
                  data-docs-search
                  hidden
                />
              </div>
              <nav class="docs-nav" data-docs-nav>
                ${sections.map(
                  (s) =>
                    html`<div class="docs-nav-section">${s.title}</div>
                      <ul class="docs-nav-list">
                        ${s.items.map(
                            (d) =>
                              html`<li>
                                <a
                                  href="${d.url}"
                                  data-doc-id="${d.id}"
                                  ${d.id === doc.id
                                    ? html`data-active="true"
                                      aria-current="page"`
                                    : null}
                                  >${d.title}</a
                                >
                              </li>`,
                          )}
                      </ul>`,
                )}
              </nav>
              <div
                class="docs-results"
                data-docs-results
                aria-live="polite"
                hidden
              ></div>
            </aside>
            <article class="docs-content">
              <div class="docs-breadcrumb" data-docs-breadcrumb>
                ${sectionTitle(doc.section)} / ${doc.title}
              </div>
              <div class="prose" data-docs-content>${raw(body)}</div>
              <p class="docs-source">
                <a
                  href="https://github.com/${doc.githubRepo}/tree/${doc.githubRef}"
                  >Source repository</a
                >
                ·
                <a
                  href="${doc.editUrl}"
                  >Edit this page</a
                >
                · <a href="${rawUrl(doc)}">View Markdown</a>
              </p>
              <div class="docs-prevnext">
                <div class="docs-prevnext-item" data-docs-prev>
                  ${raw(prevNext(doc.previous, 'Previous'))}
                </div>
                <div class="docs-prevnext-item" data-docs-next>
                  ${raw(prevNext(doc.next, 'Next'))}
                </div>
              </div>
            </article>
            <aside class="docs-toc" aria-label="On this page" data-docs-toc>
              ${raw(toc)}
            </aside>
          </div>
        </div>
      </section>
      ${legacy
        ? html`<script type="application/json" data-legacy-routes>
            ${raw(legacy.replace(/</g, '\\u003c'))}
          </script>`
        : null}
    </main>`,
  )
}
export default docsLayout
