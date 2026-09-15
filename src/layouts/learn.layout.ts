import { html, render } from 'fragtml'
import type { LayoutFunction } from '@domstack/static/types.js'
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
  return children.replace('<!-- learn:chapter-bar -->', bar)
}
export default learn
