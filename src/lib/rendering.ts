import { html, render } from 'fragtml'
import { load } from 'cheerio'
import { highlight } from './markdown.ts'
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

export function rootContent(content: string): string {
  if (!content.includes('<pre')) return content
  const $ = load(content, {}, false)
  $('pre code').each((_i, el) => {
    const language = $(el).attr('class')?.match(/language-([\w+-]+)/)?.[1]
    if (language) {
      const highlighted = highlight($(el).text(), language)
      if (highlighted) $(el).html(highlighted).addClass('hljs')
    }
  })
  return $.html()
}
