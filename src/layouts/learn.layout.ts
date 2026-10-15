import { html, raw, render } from 'fragtml'
import { load } from 'cheerio'
import type { LayoutFunction } from '@domstack/static/types.js'
import type {} from './root.layout.ts'
import { names } from '#lib/navigation.ts'
export const parentLayout = 'root'
interface LearnVars {
  product: string
  chapter?: {
    label: string
    title: string
    position: string
    links: { url: string; label: string }[]
  }
}
const learn: LayoutFunction<LearnVars, string> = ({ children, vars: v }) => {
  const c = v.chapter
  if (!c) return children
  const bar = render(
    html`<div class="learn-lesson-bar">
      <a
        class="learn-lesson-menu"
        href="/${v.product}/learn/"
        aria-label="Back to Learn ${names[v.product]}"
      ></a>
      <div class="learn-lesson-title">
        <img
          src="/docs/branding/assets/logo-icon-small.png"
          alt=""
          width="30"
          height="30"
        />
        <div><strong>${c.label}</strong><span>${c.title}</span></div>
      </div>
      <nav class="learn-lesson-nav" aria-label="Lesson navigation">
        ${c.links.map(
          (link, i) =>
            html`${i === 1 ? html`<span>${c.position}</span>` : null}<a
                href="${link.url}"
                >${link.label}</a
              >`,
        )}
      </nav>
    </div>`,
  )
  if (children.includes('<!-- learn:chapter-bar -->')) return children.replace('<!-- learn:chapter-bar -->', bar)
  // Lessons are Markdown; retain a shared shell and label every copyable block
  // from its preceding filename or command heading.
  const $ = load(children, {}, false)
  const title = $('h1').first().text() || c.title
  $('h1').first().remove()
  $('pre').each((_i, element) => {
    const pre = $(element)
    const heading = pre.prev('h3')
    const label = heading.text().split(' — ')[0] || (pre.find('code').attr('class')?.includes('language-bash') ? 'Terminal' : 'Example output')
    const id = heading.attr('id')
    heading.remove()
    pre.wrap('<div class="learn-code" data-code-block></div>')
    if (pre.find('code').attr('class')?.includes('language-bash')) pre.parent().attr('data-code-kind', 'terminal')
    pre.before(render(html`<div class="learn-code-header">${id ? html`<h3 class="learn-code-title" id="${id}">${label}</h3>` : html`<span class="learn-code-title">${label}</span>`}<button class="learn-copy" type="button" data-copy-code aria-label="Copy ${label}"></button></div>`))
  })
  return render(html`<main id="main"><section class="section"><div class="container"><article class="learn-lesson-shell">
    ${raw(bar)}
    <header class="learn-lesson-heading"><div class="learn-lesson-number">${c.position.split(' / ')[0]}</div><div><small>${c.label}</small><h1>${title}</h1></div></header>
    <div class="prose learn-prose">${raw($.html())}</div>
  </article></div></section></main>`)
}
export default learn

declare module '@domstack/static/types.js' {
  interface LayoutRegistry {
    learn: {
      parentLayout: typeof parentLayout
      render: typeof learn
    }
  }
}
