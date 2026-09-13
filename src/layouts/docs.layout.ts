import { html, raw, render } from 'fragtml'
import { load } from 'cheerio'
import type { LayoutFunction } from '@domstack/static/types.js'
import {
  collections,
  sectionTitle,
  type Collection,
} from '../lib/collections.ts'
import { rawUrl, type Doc, type DocsData } from '../lib/docs.ts'
export const parentLayout = 'root'
export const vars = { dataDeps: ['docs'] }
export function article(
  content: string,
  spec = false,
): { body: string; toc: string } {
  const $ = load(content, {}, false)
  const headings: { id: string; title: string; level: string }[] = []
  $('h2,h3,h4,h5').each((_i, h) => {
    const id = $(h).attr('id') || ''
    const title = $(h).text()
    if (id) {
      headings.push({ id, title, level: h.tagName })
      $(h).append(
        render(
          html`<a
            class="docs-heading-anchor"
            href="#${id}"
            aria-label="Link to this section"
            >#</a
          >`,
        ),
      )
    }
  })
  return {
    body: $.html(),
    toc: render(
      spec
        ? html`<div class="spec-toc-title">Table of contents</div>
            <div class="spec-toc">
              ${headings.map(
                (h) =>
                  html`<a
                    href="#${h.id}"
                    data-level="${h.level}"
                    data-id="${h.id}"
                    >${h.title}</a
                  >`,
              )}
            </div>`
        : html`<div class="docs-toc-title">On this page</div>
            <ul class="docs-toc-list">
              ${headings
                .filter((h) => ['h2', 'h3'].includes(h.level))
                .map(
                  (h) =>
                    html`<li data-level="${h.level}">
                      <a href="#${h.id}">${h.title}</a>
                    </li>`,
                )}
            </ul>`,
    ),
  }
}
function prevNext(doc: Doc | undefined, label: string): string {
  return doc
    ? render(
        html`<a class="docs-prevnext-link" href="${doc.url}"
          ><span class="docs-prevnext-label">${label}</span
          ><span class="docs-prevnext-title">${doc.title}</span></a
        >`,
      )
    : ''
}
const docsLayout: LayoutFunction<
  Record<string, any>,
  string,
  string,
  DocsData
> = ({ vars: v, children, data }) => {
  const collection = v.docsCollection as Collection
  const c = collections[collection]
  const docs = data.docs[collection]
  const idx = docs.findIndex((d) => d.sourcePath === v.sourcePath)
  const doc = docs[idx]
  const sections = [...new Set(docs.map((d) => d.section))]
  const { body, toc } = article(children)
  const legacy =
    doc.id === 'start'
      ? JSON.stringify(Object.fromEntries(docs.map((d) => [d.id, d.url])))
      : ''
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
                    html`<div class="docs-nav-section">${sectionTitle(s)}</div>
                      <ul class="docs-nav-list">
                        ${docs
                          .filter((d) => d.section === s)
                          .map(
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
                  href="https://github.com/oro-computer/website/blob/master/src${doc.url}page.md"
                  >Edit this page</a
                >
                · <a href="${rawUrl(doc)}">View Markdown</a>
              </p>
              <div class="docs-prevnext">
                <div class="docs-prevnext-item" data-docs-prev>
                  ${raw(prevNext(docs[idx - 1], 'Previous'))}
                </div>
                <div class="docs-prevnext-item" data-docs-next>
                  ${raw(prevNext(docs[idx + 1], 'Next'))}
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
